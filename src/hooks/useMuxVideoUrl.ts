import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type MuxStatus = "idle" | "uploading" | "processing" | "ready" | "errored" | "unknown";

interface MuxVideoState {
  url: string | null;
  playbackId: string | null;
  muxStatus: MuxStatus;
  thumbnailUrl: string | null;
  error?: string | null;
}

export function useMuxVideoUrl(value: string | null | undefined): MuxVideoState {
  const [state, setState] = useState<MuxVideoState>({
    url: null,
    playbackId: null,
    muxStatus: "unknown",
    thumbnailUrl: null,
    error: null,
  });

  useEffect(() => {
    if (!value) {
      setState({
        url: null,
        playbackId: null,
        muxStatus: "idle",
        thumbnailUrl: null,
        error: null,
      });
      return;
    }

    // URL externa normal (YouTube, Loom, etc)
    if (!value.startsWith("mux-video-")) {
      setState({
        url: value,
        playbackId: null,
        muxStatus: "ready",
        thumbnailUrl: null,
        error: null,
      });
      return;
    }

    const videoId = value.replace("mux-video-", "");
    if (!videoId) {
      setState({
        url: null,
        playbackId: null,
        muxStatus: "unknown",
        thumbnailUrl: null,
        error: null,
      });
      return;
    }

    let cancelled = false;
    let timeoutId: NodeJS.Timeout | null = null;

    async function fetchVideo() {
      const { data, error } = await supabase
        .from("videos")
        .select("mux_status, mux_playback_id, mux_thumbnail_url")
        .eq("id", videoId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("[useMuxVideoUrl] erro supabase:", error);
        setState((prev) => ({
          ...prev,
          url: null,
          playbackId: null,
          muxStatus: "errored",
          error: error.message,
        }));
        return;
      }

      if (!data) {
        // ainda não chegou o webhook
        setState((prev) => ({
          ...prev,
          url: null,
          playbackId: null,
          muxStatus: "processing",
        }));
        
        if (!cancelled) {
          timeoutId = setTimeout(fetchVideo, 4000);
        }
        return;
      }

      const status = (data.mux_status as MuxStatus) || "unknown";

      if (status === "ready" && data.mux_playback_id) {
        const playbackId = data.mux_playback_id as string;

        setState({
          url: `https://stream.mux.com/${playbackId}.m3u8`,
          playbackId,
          muxStatus: "ready",
          thumbnailUrl: data.mux_thumbnail_url ?? null,
          error: null,
        });
      } else if (status === "errored") {
        setState((prev) => ({
          ...prev,
          url: null,
          playbackId: null,
          muxStatus: "errored",
        }));
      } else {
        // uploading, preparing, etc
        setState((prev) => ({
          ...prev,
          url: null,
          playbackId: null,
          muxStatus: status === "preparing" ? "processing" : status,
        }));
        
        if (!cancelled) {
          timeoutId = setTimeout(fetchVideo, 4000);
        }
      }
    }

    fetchVideo();

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [value]);

  return state;
}
