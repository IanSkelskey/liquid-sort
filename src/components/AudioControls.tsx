import { useState, useCallback, useEffect, useRef } from 'react';
import { setMusicVolume, getMusicVolume, setMusicMuted } from '../audio/music';
import { setSfxVolume, getSfxVolume, setSfxMuted } from '../audio/sfx';
import './AudioControls.css';

export function AudioControls() {
  const [open, setOpen] = useState(false);
  const [musicVol, setMusicVol] = useState(() => getMusicVolume());
  const [sfxVol, setSfxVol] = useState(() => getSfxVolume());
  const [muted, setMuted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMusicChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setMusicVol(v);
    setMusicVolume(v);
  }, []);

  const handleSfxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setSfxVol(v);
    setSfxVolume(v);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    setMusicMuted(next);
    setSfxMuted(next);
  }, [muted]);

  // Close panel when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, [open]);

  return (
    <div className="audio-controls" ref={panelRef}>
      {open && (
        <div className="audio-panel">
          <div className="audio-panel-header">
            <span className="audio-panel-title">Audio</span>
            <button
              className={`audio-mute-btn ${muted ? 'audio-mute-btn--active' : ''}`}
              onClick={toggleMute}
            >
              {muted ? 'Unmute' : 'Mute All'}
            </button>
          </div>
          <div className="audio-slider-group">
            <label className="audio-slider-label">
              <span>Music</span>
              <span className="audio-slider-value">{Math.round(musicVol * 100)}%</span>
            </label>
            <input
              type="range"
              className="audio-slider"
              min="0"
              max="1"
              step="0.01"
              value={musicVol}
              onChange={handleMusicChange}
            />
          </div>
          <div className="audio-slider-group">
            <label className="audio-slider-label">
              <span>Sound Effects</span>
              <span className="audio-slider-value">{Math.round(sfxVol * 100)}%</span>
            </label>
            <input
              type="range"
              className="audio-slider"
              min="0"
              max="1"
              step="0.01"
              value={sfxVol}
              onChange={handleSfxChange}
            />
          </div>
        </div>
      )}
      <button
        className={`audio-toggle ${muted ? 'audio-toggle--muted' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title="Audio settings"
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}
