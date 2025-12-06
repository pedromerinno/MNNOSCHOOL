import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, mux-signature",
};

interface MuxWebhookEvent {
  type: string;
  data: {
    id: string; // asset_id ou upload_id dependendo do evento
    upload_id?: string;
    status?: string;
    playback_ids?: Array<{ id: string; policy: string }>;
    duration?: number;
    passthrough?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    console.log("[mux-webhook] Body bruto:", rawBody.substring(0, 500));

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error("[mux-webhook] Erro ao parsear JSON:", e);
      return new Response(
        JSON.stringify({
          error: "invalid_json",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const events: MuxWebhookEvent[] = Array.isArray(payload)
      ? payload
      : [payload];

    console.log(
      `[mux-webhook] Recebidos ${events.length} evento(s) do Mux`,
    );

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "[mux-webhook] SUPABASE_URL ou SERVICE_ROLE_KEY não configurados",
      );
      return new Response(
        JSON.stringify({
          error: "missing_env",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);

    for (const event of events) {
      console.log("[mux-webhook] Evento:", event.type, event.data.id);

      switch (event.type) {
        case "video.upload.asset_created": {
          // upload_id identifica o upload; data.id costuma ser o asset_id
          const uploadId = event.data.upload_id || event.data.id;
          const assetId = event.data.id;

          if (!uploadId) {
            console.error(
              "[mux-webhook] upload_id não encontrado em video.upload.asset_created",
              event,
            );
            break;
          }

          const { error } = await supabaseClient
            .from("videos")
            .update({
              mux_asset_id: assetId,
              mux_status: "preparing",
            })
            .eq("mux_upload_id", uploadId);

          if (error) {
            console.error(
              "[mux-webhook] Erro ao atualizar vídeo em asset_created:",
              error,
            );
          } else {
            console.log(
              "[mux-webhook] Vídeo atualizado em asset_created (upload_id):",
              uploadId,
            );
          }
          break;
        }

        case "video.asset.ready": {
          const assetId = event.data.id;
          const playbackIds = event.data.playback_ids || [];
          const passthrough = (event.data as any).passthrough || null;
          const uploadId = (event.data as any).upload_id || null;

          const publicPlaybackId =
            playbackIds.find((p) => p.policy === "public")?.id ||
            playbackIds[0]?.id;

          if (!assetId) {
            console.error(
              "[mux-webhook] asset_id não encontrado em video.asset.ready",
            );
            break;
          }

          let videoId: string | null = null;

          // 1) Tenta via passthrough: "video_<uuid>"
          if (passthrough && passthrough.startsWith("video_")) {
            videoId = passthrough.replace("video_", "");
            console.log(
              "[mux-webhook] vídeo identificado via passthrough:",
              videoId,
            );
          }

          // Monta o update base
          const updateData = {
            mux_status: "ready",
            mux_asset_id: assetId,
            mux_playback_id: publicPlaybackId || null,
            mux_duration: event.data.duration
              ? Math.round(event.data.duration)
              : null,
            mux_thumbnail_url: publicPlaybackId
              ? `https://image.mux.com/${publicPlaybackId}/thumbnail.jpg?width=1280&height=720&fit_mode=smartcrop`
              : null,
          };

          let query = supabaseClient.from("videos").update(updateData);

          // Ordem de match:
          // 1. id (via passthrough)
          // 2. mux_upload_id (via upload_id)
          // 3. mux_asset_id (fallback)
          if (videoId) {
            query = query.eq("id", videoId);
            console.log("[mux-webhook] Atualizando por id:", videoId);
          } else if (uploadId) {
            query = query.eq("mux_upload_id", uploadId);
            console.log("[mux-webhook] Atualizando por mux_upload_id:", uploadId);
          } else {
            query = query.eq("mux_asset_id", assetId);
            console.log("[mux-webhook] Atualizando por mux_asset_id:", assetId);
          }

          const { error } = await query;

          if (error) {
            console.error(
              "[mux-webhook] Erro ao atualizar vídeo em asset.ready:",
              error,
            );
          } else {
            console.log(
              "[mux-webhook] Vídeo atualizado em asset.ready:",
              videoId || uploadId || assetId,
            );
          }
          break;
        }

        case "video.asset.errored": {
          const assetId = event.data.id;
          if (!assetId) break;

          const { error } = await supabaseClient
            .from("videos")
            .update({
              mux_status: "errored",
            })
            .eq("mux_asset_id", assetId);

          if (error) {
            console.error(
              "[mux-webhook] Erro ao marcar vídeo como errored:",
              error,
            );
          } else {
            console.log(
              "[mux-webhook] Vídeo marcado como errored:",
              assetId,
            );
          }
          break;
        }

        default:
          console.log("[mux-webhook] Evento ignorado:", event.type);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("[mux-webhook] Erro inesperado:", error);
    return new Response(
      JSON.stringify({
        error: "internal_error",
        message: error?.message ?? String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
