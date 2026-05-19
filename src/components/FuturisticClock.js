import React, { useState, useEffect, useRef } from 'react';
import './FuturisticClock.css';

const FuturisticClock = () => {
  const [time, setTime] = useState(new Date());
  const [timezone, setTimezone] = useState('local');
  const [hourFormat, setHourFormat] = useState('24');
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);
  const clockRef = useRef(null);

  // Обновление времени каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Форматирование времени с учетом часового пояса и формата
  const getFormattedTime = () => {
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: hourFormat === '12',
      timeZone: timezone === 'local' ? undefined : timezone
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(time);
  };

  // Форматирование даты
  const getFormattedDate = () => {
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      timeZone: timezone === 'local' ? undefined : timezone
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(time);
  };

  // Часовые пояса
  const timezones = [
    { value: 'local', label: 'Local Time' },
    { value: 'America/New_York', label: 'NYC (EST)' },
    { value: 'America/Chicago', label: 'Chicago (CST)' },
    { value: 'America/Denver', label: 'Denver (MST)' },
    { value: 'America/Los_Angeles', label: 'LA (PST)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  ];

  const timeString = getFormattedTime();
  const dateString = getFormattedDate();
  
  let displayTime = timeString;
  let ampm = '';
  
  if (hourFormat === '12' && timeString.includes(' ')) {
    const parts = timeString.split(' ');
    displayTime = parts[0];
    ampm = parts[1];
  }
  
  const timeParts = displayTime.split(':');

  return (
    <div className="clock-wrapper" ref={clockRef}>
      {/* QuantumCRM - большой и отдельно */}


      {/* Часы - маленькие и скромные */}
      <div className="clock-box">
        <div className="clock-display">
          <div className="clock-digits">
            <span className="digit-group">
              <span className="digit hour-tens">{timeParts[0][0]}</span>
              <span className="digit hour-ones">{timeParts[0][1]}</span>
            </span>
            <span className="colon">:</span>
            <span className="digit-group">
              <span className="digit minute-tens">{timeParts[1][0]}</span>
              <span className="digit minute-ones">{timeParts[1][1]}</span>
            </span>
            <span className="colon">:</span>
            <span className="digit-group seconds-group">
              <span className="digit second-tens">{timeParts[2][0]}</span>
              <span className="digit second-ones">{timeParts[2][1]}</span>
            </span>
            {ampm && <span className="ampm">{ampm}</span>}
          </div>
          <div className="clock-date">{dateString}</div>
        </div>

        <div className="clock-controls">
          <div className="hour-format-toggle">
            <button 
              className={`format-btn ${hourFormat === '24' ? 'active' : ''}`}
              onClick={() => setHourFormat('24')}
            >
              24h
            </button>
            <button 
              className={`format-btn ${hourFormat === '12' ? 'active' : ''}`}
              onClick={() => setHourFormat('12')}
            >
              12h
            </button>
          </div>

          <div className="timezone-selector">
            <button 
              className="timezone-btn"
              onClick={() => setShowTimezonePicker(!showTimezonePicker)}
            >
              <span className="timezone-icon">🌐</span>
              <span className="timezone-label">
                {timezones.find(tz => tz.value === timezone)?.label || 'Local'}
              </span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {showTimezonePicker && (
              <div className="timezone-dropdown">
                {timezones.map(tz => (
                  <button
                    key={tz.value}
                    className={`timezone-option ${timezone === tz.value ? 'active' : ''}`}
                    onClick={() => {
                      setTimezone(tz.value);
                      setShowTimezonePicker(false);
                    }}
                  >
                    {tz.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuturisticClock;