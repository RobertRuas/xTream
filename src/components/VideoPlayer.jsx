'use client';

import { useEffect, useRef, useState, memo, useCallback } from 'react';
import Hls from 'hls.js';
import { X, Settings } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const VideoPlayer = memo(({ url, onClose }) => {
    const { settings } = useAppContext();
    const bufferSeconds = settings?.bufferSeconds || 120;
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const overlayRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [qualityLevels, setQualityLevels] = useState([]);
    const [currentQuality, setCurrentQuality] = useState(-1);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [stats, setStats] = useState({ bandwidth: 0, buffer: 0, resolution: '' });

    // ─── Fullscreen helpers ─────────────────────────────────────────────────────
    const enterFullscreen = useCallback(() => {
        const el = overlayRef.current;
        if (!el) return;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    }, []);

    const exitFullscreen = useCallback(() => {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    }, []);

    const isFullscreen = useCallback(() => {
        return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
    }, []);

    // Enter fullscreen whenever a new URL is set; exit when cleared
    useEffect(() => {
        if (url) {
            // Small timeout to ensure the overlay is visible first
            const t = setTimeout(enterFullscreen, 100);
            return () => clearTimeout(t);
        } else {
            if (isFullscreen()) exitFullscreen();
        }
    }, [url, enterFullscreen, exitFullscreen, isFullscreen]);

    // Click on the video area → toggle fullscreen (not on the controls)
    const handleVideoClick = useCallback((e) => {
        // Avoid triggering if the user clicked a button
        if (e.target.closest('button, .quality-selector')) return;
        if (isFullscreen()) exitFullscreen();
        else enterFullscreen();
    }, [isFullscreen, exitFullscreen, enterFullscreen]);

    // Close the player cleanly and exit fullscreen
    const handleClose = useCallback(() => {
        if (isFullscreen()) exitFullscreen();
        onClose();
    }, [isFullscreen, exitFullscreen, onClose]);

    // ─── Player stats ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!settings?.showPlayerStats || !url) return;
        const interval = setInterval(() => {
            const video = videoRef.current;
            if (!video || !hlsRef.current) return;
            let bufferLen = 0;
            if (video.buffered.length > 0) {
                try { bufferLen = video.buffered.end(video.buffered.length - 1) - video.currentTime; } catch (e) { }
            }
            const level = hlsRef.current.levels?.[hlsRef.current.currentLevel];
            setStats({
                bandwidth: ((hlsRef.current.bandwidthEstimate || 0) / 1024 / 1024).toFixed(1),
                buffer: Math.max(0, Math.round(bufferLen)),
                resolution: level ? `${level.width}x${level.height}` : 'Auto',
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [settings?.showPlayerStats, url]);

    // ─── HLS / video setup ───────────────────────────────────────────────────────
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const cleanup = () => {
            if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
            setIsLoading(true);
            setQualityLevels([]);
            setCurrentQuality(-1);
            setShowQualityMenu(false);
        };

        if (!url) { cleanup(); video.pause(); video.src = ''; return; }

        cleanup();
        const isM3U8 = url.toLowerCase().includes('.m3u8');

        if (isM3U8 && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                maxBufferLength: bufferSeconds,
                maxMaxBufferLength: 300,
                liveSyncDurationCount: 3,
                backBufferLength: 60,
                manifestLoadingMaxRetry: 10,
                levelLoadingMaxRetry: 10,
            });
            hlsRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                setQualityLevels(data.levels || []);
                setIsLoading(false);
                video.play().catch(e => console.warn('Autoplay block:', e));
            });
            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
                    else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
                    else cleanup();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', () => { setIsLoading(false); video.play().catch(console.warn); });
            video.addEventListener('waiting', () => setIsLoading(true));
            video.addEventListener('playing', () => setIsLoading(false));
        } else {
            video.src = url;
            video.addEventListener('canplay', () => setIsLoading(false));
            video.play().catch(e => console.warn('Fallback play error:', e));
        }

        return cleanup;
    }, [url, bufferSeconds]);

    const changeQuality = (index) => {
        if (hlsRef.current) { hlsRef.current.currentLevel = index; setCurrentQuality(index); setShowQualityMenu(false); }
    };

    return (
        <div
            ref={overlayRef}
            id="player-overlay"
            onClick={handleVideoClick}
            style={{ display: url ? 'flex' : 'none', position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 4000, flexDirection: 'column', cursor: 'pointer' }}
        >
            {/* Close button */}
            <button
                className="close-player back-button"
                onClick={e => { e.stopPropagation(); handleClose(); }}
                aria-label="Back"
                style={{ zIndex: 4010 }}
            >
                <X size={24} />
            </button>

            {/* Loading spinner */}
            {isLoading && (
                <div className="player-loader">
                    <div className="spinner" />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Sincronizando Mídia...</span>
                </div>
            )}

            {/* Technical stats */}
            {settings?.showPlayerStats && (
                <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '25px', left: '25px', zIndex: 4050, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#EEE', fontFamily: 'monospace', fontSize: '0.75rem', pointerEvents: 'auto', cursor: 'default' }}>
                    <div>Rede: {stats.bandwidth} Mbps</div>
                    <div>Buffer: {stats.buffer}s / {bufferSeconds}s</div>
                    <div>Resolução: {stats.resolution}</div>
                </div>
            )}

            {/* Quality selector */}
            {qualityLevels.length > 1 && (
                <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 4055 }}>
                    <button className="action-btn" onClick={() => setShowQualityMenu(!showQualityMenu)} title="Qualidade do Stream" style={{ borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Settings size={20} />
                    </button>
                    {showQualityMenu && (
                        <div className="quality-selector">
                            <div className={`quality-item ${currentQuality === -1 ? 'active' : ''}`} onClick={() => changeQuality(-1)}>Automático</div>
                            {qualityLevels.map((level, idx) => (
                                <div key={idx} className={`quality-item ${currentQuality === idx ? 'active' : ''}`} onClick={() => changeQuality(idx)}>
                                    {level.height}p ({Math.round(level.bitrate / 1024)} kbps)
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <video
                ref={videoRef}
                controls
                preload="auto"
                playsInline
                onClick={e => e.stopPropagation()} // native controls handle their own clicks
                style={{ width: '100%', height: '100%', backgroundColor: '#000', cursor: 'default' }}
            />
        </div>
    );
});

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
