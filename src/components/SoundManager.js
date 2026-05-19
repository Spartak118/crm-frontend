import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const SoundContext = createContext();

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('soundMuted');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('soundVolume');
    return saved ? JSON.parse(saved) : 0.7;
  });

  // Создаем аудио объекты
  const sounds = useRef({
    noti: null,
    success: null,
    reminder: null,
    error: null,
    complete: null
  });

  // Загружаем звуки при монтировании
  useEffect(() => {
    // Создаем аудио элементы для каждого звука
    sounds.current = {
      noti: new Audio('/sounds/noti.mp3'),
      success: new Audio('/sounds/success.mp3'),
      reminder: new Audio('/sounds/reminder.mp3'),
      error: new Audio('/sounds/error.mp3'),
      complete: new Audio('/sounds/complete.mp3')
    };

    // Устанавливаем громкость для всех звуков
    Object.values(sounds.current).forEach(audio => {
      if (audio) {
        audio.volume = volume;
      }
    });

    // Очистка при размонтировании
    return () => {
      Object.values(sounds.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  // Обновляем громкость при изменении
  useEffect(() => {
    Object.values(sounds.current).forEach(audio => {
      if (audio) {
        audio.volume = volume;
      }
    });
    localStorage.setItem('soundVolume', JSON.stringify(volume));
  }, [volume]);

  // Сохраняем состояние mute
  useEffect(() => {
    localStorage.setItem('soundMuted', JSON.stringify(isMuted));
  }, [isMuted]);

  // Функция для воспроизведения звука
  const playSound = (soundName, options = {}) => {
    if (isMuted) return;
    
    const audio = sounds.current[soundName];
    if (!audio) return;

    // Останавливаем если уже играет
    audio.pause();
    audio.currentTime = 0;
    
    // Устанавливаем опции
    if (options.loop) audio.loop = true;
    if (options.volume) audio.volume = options.volume;
    
    // Воспроизводим
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
    });
  };

  // Функция для остановки звука
  const stopSound = (soundName) => {
    const audio = sounds.current[soundName];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
    }
  };

  // Остановить все звуки
  const stopAllSounds = () => {
    Object.values(sounds.current).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.loop = false;
      }
    });
  };

  // Переключить mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Изменить громкость
  const changeVolume = (newVolume) => {
    const vol = Math.max(0, Math.min(1, newVolume));
    setVolume(vol);
  };

  // Проверить доступность звуков
  const checkSounds = async () => {
    const results = {};
    for (const [name, audio] of Object.entries(sounds.current)) {
      if (audio) {
        try {
          await audio.load();
          results[name] = true;
        } catch {
          results[name] = false;
        }
      }
    }
    return results;
  };

  const value = {
    playSound,
    stopSound,
    stopAllSounds,
    toggleMute,
    changeVolume,
    checkSounds,
    isMuted,
    volume
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};