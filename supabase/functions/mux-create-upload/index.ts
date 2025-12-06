// supabase/functions/mux-create-upload/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MuxUploadData {
  id: string;
  url: string;
  [key: string]: any;
}

interface MuxDirectUploadResponse {
  data: MuxUploadData;
  [key: string]: any;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1) Ler body
    let body: any;
    try {
      body = await req.json();
      console.log(
        "[mux-create-upload] Body recebido:",
        JSON.stringify(body, null, 2),
      );
    } catch (parseError) {
      console.error("[mux-create-upload] Erro ao parsear body:", parseError);
      return new Response(
        JSON.stringify({
          error: "invalid_body",
          message: "Body inválido. Esperado JSON.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { company_id } = body;
    if (!company_id) {
      console.error("[mux-create-upload] company_id ausente no body");
      return new Response(
        JSON.stringify({
          error: "missing_company_id",
          message: "company_id é obrigatório.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2) Criar cliente Supabase com SERVICE ROLE
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[mux-create-upload] SUPABASE_URL ou SERVICE_ROLE_KEY ausentes");
      return new Response(
        JSON.stringify({
          error: "missing_supabase_env",
          message: "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);

    // 3) Criar vídeo "placeholder" na tabela videos
    const { data: video, error: videoError } = await supabaseClient
      .from("videos")
      .insert({
        company_id,
        source: "mux",
        mux_status: "uploading",
      })
      .select("id")
      .single();

    if (videoError || !video) {
      console.error("[mux-create-upload] Erro ao criar vídeo:", {
        videoError,
        video,
      });
      return new Response(
        JSON.stringify({
          error: "video_insert_failed",
          message: "Não foi possível criar o vídeo na tabela videos.",
          details: videoError?.message ?? videoError,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const videoId: string = video.id;
    console.log("[mux-create-upload] Vídeo criado com id:", videoId);

    // 4) Chamar Mux para criar Direct Upload
    const muxTokenId = Deno.env.get("MUX_TOKEN_ID") ?? "";
    const muxTokenSecret = Deno.env.get("MUX_TOKEN_SECRET") ?? "";

    if (!muxTokenId || !muxTokenSecret) {
      console.error("[mux-create-upload] Credenciais do Mux ausentes");
      return new Response(
        JSON.stringify({
          error: "missing_mux_env",
          message: "MUX_TOKEN_ID e MUX_TOKEN_SECRET são obrigatórios.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const authHeader = "Basic " + btoa(`${muxTokenId}:${muxTokenSecret}`);

    const muxResponse = await fetch("https://api.mux.com/video/v1/uploads", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        new_asset_settings: {
          playback_policy: ["public"],
          passthrough: `video_${videoId}`,
        },
        cors_origin: "*",
      }),
    });

    const rawText = await muxResponse.text();
    console.log(
      "[mux-create-upload] Resposta bruta do Mux (primeiros 500 chars):",
      rawText.substring(0, 500),
    );

    if (!muxResponse.ok) {
      console.error("[mux-create-upload] Erro do Mux:", muxResponse.status, rawText);
      return new Response(
        JSON.stringify({
          error: "mux_error",
          status: muxResponse.status,
          message: "Erro ao criar Direct Upload no Mux.",
          details: rawText,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let muxData: MuxDirectUploadResponse;
    try {
      muxData = JSON.parse(rawText);
    } catch (jsonError) {
      console.error("[mux-create-upload] Erro ao parsear JSON do Mux:", jsonError);
      return new Response(
        JSON.stringify({
          error: "mux_invalid_json",
          message: "Não foi possível interpretar a resposta do Mux.",
          details: String(jsonError),
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!muxData?.data?.id || !muxData.data.url) {
      console.error("[mux-create-upload] Resposta inválida do Mux (sem id/url):", muxData);
      return new Response(
        JSON.stringify({
          error: "mux_invalid_response",
          message: "Mux não retornou id/url de upload.",
          details: muxData,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const uploadId = muxData.data.id;
    const uploadUrl = muxData.data.url;

    // 5) Atualizar vídeo com mux_upload_id (opcional, mas bom ter)
    const { error: updateError } = await supabaseClient
      .from("videos")
      .update({
        mux_upload_id: uploadId,
      })
      .eq("id", videoId);

    if (updateError) {
      console.error("[mux-create-upload] Erro ao atualizar vídeo com mux_upload_id:", updateError);
      // não vamos falhar a requisição por causa disso, só logar
    }

    const responseData = {
      upload_id: uploadId,
      url: uploadUrl,
      video_id: videoId,
      status: "upload_created",
    };

    console.log("[mux-create-upload] Retornando para frontend:", responseData);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[mux-create-upload] Erro inesperado:", error);
    return new Response(
      JSON.stringify({
        error: "internal_error",
        message: "Erro interno ao criar upload do Mux.",
        details: error?.message ?? String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
