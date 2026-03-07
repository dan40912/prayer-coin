"use client";

import { useAudio } from "@/context/AudioContext";
import { useEffect, useRef } from "react";
import "@/styles/prayer-modern.css"; // We will create this next

export default function GlobalPlayer() {
    const {
        currentTrack,
        isPlaying,
        isExpanded,
        setIsExpanded,
        togglePlay,
        progress,
        duration,
        seek,
        playNext,
        playPrev
    } = useAudio();

    const progressBarRef = useRef(null);

    if (!currentTrack) return null;

    const handleProgressClick = (e) => {
        if (progressBarRef.current && duration > 0) {
            const rect = progressBarRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.min(Math.max(x / rect.width, 0), 1);
            seek(percent * duration);
        }
    };

    const formatTime = (t) => {
        if (!t) return "0:00";
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div className="media-player-global glass-panel" style={{ display: 'flex' }}>
            {/* We can use the existing 'isExpanded' to toggle a full screen class, but for simplicity, let's keep it fixed bottom as per theme first */}
            <div className="player-content">
                <div className="track-info">
                    {currentTrack.avatarUrl ? (
                         <img src={currentTrack.avatarUrl} alt="Speaker" className={`track-avatar ${isPlaying ? 'pulse' : ''}`} />
                    ) : (
                         <div className={`track-avatar ${isPlaying ? 'pulse' : ''}`} style={{display:'flex', alignItems:'center', justifyContent:'center', background:'var(--accent-gold)'}}>
                             {currentTrack.speaker?.[0]}
                         </div>
                    )}
                    <div className="track-details">
                        <span className="track-title">{currentTrack.speaker}</span>
                        <span className="track-time">{formatTime(progress)} / {formatTime(duration)}</span>
                    </div>
                </div>

                <div className="player-controls">
                    <button className="btn-icon" onClick={playPrev}><i className="fa-solid fa-backward-step"></i></button>
                    <button className="btn-icon play-pause-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                        <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                    </button>
                    <button className="btn-icon" onClick={playNext}><i className="fa-solid fa-forward-step"></i></button>
                    <button className="btn-icon"><i className="fa-solid fa-repeat"></i></button>
                </div>
            </div>
            
            <div className="progress-bar-container" onClick={handleProgressClick} ref={progressBarRef}>
                <div className="progress-fill" style={{ width: `${(progress / duration) * 100}%` }}></div>
            </div>
        </div>
    );
}
