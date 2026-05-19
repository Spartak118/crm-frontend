import React, { useState, useEffect } from 'react';
import { useSound } from './SoundManager';
import './SoundControls.css';

const SoundControls = () => {
  const { isMuted, toggleMute, changeVolume, volume, playSound, checkSounds } = useSound();
  const [showControls, setShowControls] = useState(false);
  const [soundStatus, setSoundStatus] = useState({});

  useEffect(() => {
    // Проверяем доступность звуков
    const check = async () => {
      const status = await checkSounds();
      setSoundStatus(status);
    };
    check();
  }, []);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    changeVolume(newVolume);
    // Тестовый звук
    playSound('noti');
  };

  const testSound = (soundName) => {
    playSound(soundName);
  };

  const allSoundsWorking = Object.values(soundStatus).every(v => v === true);

  return (
    <div className="sound-controls-container">
      <button 
        className={`sound-toggle-btn ${showControls ? 'active' : ''}`}
        onClick={() => setShowControls(!showControls)}
        title="Sound settings"
      >
        {isMuted ? '🔇' : '🔊'}
        {!allSoundsWorking && <span className="sound-warning">⚠️</span>}
      </button>

      {showControls && (
        <div className="sound-controls-panel">
          <div className="sound-controls-header">
            <h4>Sound Settings</h4>
            <button onClick={() => setShowControls(false)}>✕</button>
          </div>

          <div className="sound-control">
            <label>
              <input
                type="checkbox"
                checked={!isMuted}
                onChange={toggleMute}
              />
              Enable Sounds
            </label>
          </div>

          <div className="sound-control">
            <label>Volume: {Math.round(volume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              disabled={isMuted}
            />
          </div>

          <div className="sound-test-buttons">
            <h5>Test Sounds:</h5>
            <div className="sound-buttons-grid">
              <button 
                onClick={() => testSound('noti')}
                disabled={isMuted}
                className={soundStatus.noti ? '' : 'missing'}
                title={soundStatus.noti ? '✓ Loaded' : '✗ Missing'}
              >
                🔔 Noti
              </button>
              <button 
                onClick={() => testSound('success')}
                disabled={isMuted}
                className={soundStatus.success ? '' : 'missing'}
                title={soundStatus.success ? '✓ Loaded' : '✗ Missing'}
              >
                ✅ Success
              </button>
              <button 
                onClick={() => testSound('reminder')}
                disabled={isMuted}
                className={soundStatus.reminder ? '' : 'missing'}
                title={soundStatus.reminder ? '✓ Loaded' : '✗ Missing'}
              >
                ⏰ Reminder
              </button>
              <button 
                onClick={() => testSound('error')}
                disabled={isMuted}
                className={soundStatus.error ? '' : 'missing'}
                title={soundStatus.error ? '✓ Loaded' : '✗ Missing'}
              >
                ❌ Error
              </button>
              <button 
                onClick={() => testSound('complete')}
                disabled={isMuted}
                className={soundStatus.complete ? '' : 'missing'}
                title={soundStatus.complete ? '✓ Loaded' : '✗ Missing'}
              >
                🏁 Complete
              </button>
            </div>
          </div>

          {!allSoundsWorking && (
            <div className="sound-warning-message">
              ⚠️ Some sound files are missing.<br />
              Place MP3 files in: <code>public/sounds/</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SoundControls;