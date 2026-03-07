"use client";

import { useEffect, useMemo } from "react";
import { useAudio } from "@/context/AudioContext";
import { PRAYER_AUDIO_START_EVENT } from "@/lib/events";

const FALLBACK_SPEAKER = "Prayer Partner";

export default function PrayerAudioPlayer({ requestId, initialTrack = null }) {
  const { playTrack, setQueue } = useAudio();

  const primaryTrack = useMemo(() => {
    if (!initialTrack || !initialTrack.voiceUrl) return null;
    return {
      id: initialTrack.id ?? "primary-track",
      voiceUrl: initialTrack.voiceUrl,
      speaker: initialTrack.speaker?.trim() || FALLBACK_SPEAKER,
      message: initialTrack.message?.trim() || "",
      avatarUrl: initialTrack.avatarUrl?.trim() || "",
      responderId: initialTrack.responderId ?? null,
    };
  }, [initialTrack]);

  // Fetch all tracks for this request to build a queue
  // We can do this when the user clicks play, or pre-fetch.
  // For simplicity, let's fetch when play is triggered or just play the primary track first.

  const handlePlay = async () => {
    if (primaryTrack) {
      // Start with primary track
      playTrack(primaryTrack);

      // Optionally fetch others and update queue
      try {
        const res = await fetch(`/api/responses/${requestId}`);
        if (res.ok) {
          const data = await res.json();
          const responseTracks = data
            .filter((item) => item?.voiceUrl)
            .map((item, index) => ({
              id: item.id ?? `response-${index}`,
              voiceUrl: item.voiceUrl,
              speaker: item.isAnonymous
                ? "Anonymous"
                : item.responder?.name || item.responder?.email || FALLBACK_SPEAKER,
              message: item.message?.trim() || "",
              avatarUrl: item.responder?.avatarUrl?.trim() || "",
              responderId: item.responderId ?? null,
            }));

          // Combine primary + responses
          const fullQueue = [primaryTrack, ...responseTracks];
          // Dedupe
          const deduped = [];
          const seen = new Set();
          for (const t of fullQueue) {
            if (!seen.has(t.voiceUrl)) {
              seen.add(t.voiceUrl);
              deduped.push(t);
            }
          }

          setQueue(deduped, 0);
        }
      } catch (e) {
        console.error("Failed to load queue", e);
      }
    }
  };

  // Listen for external events (like from Hero "Listen Now" button)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleExternalStart = (event) => {
      const targetId = String(event?.detail?.requestId ?? "");
      if (targetId === String(requestId)) {
        handlePlay();
      }
    };
    window.addEventListener(PRAYER_AUDIO_START_EVENT, handleExternalStart);
    return () => window.removeEventListener(PRAYER_AUDIO_START_EVENT, handleExternalStart);
  }, [requestId, primaryTrack]);

  return (
    <div className="pray-audio-trigger-wrapper">
      <button
        type="button"
        className="btn btn-primary btn-record"
        onClick={handlePlay}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
      >
        <i className="fa-solid fa-play"></i> 
        <span>播放祈禱錄音</span>
      </button>
    </div>
  );
}
