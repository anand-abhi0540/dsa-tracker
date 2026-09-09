import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  X, 
  Timer 
} from 'lucide-react';

export default function StopwatchModal({
  isOpen,
  onClose,
  onFinishWithTime
}) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  if (!isOpen) return null;

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const hrs = Math.floor(mins / 60);
    const displayMins = mins % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(displayMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleComplete = () => {
    setIsRunning(false);
    const elapsedMinutes = Math.max(1, Math.round(seconds / 60));
    onFinishWithTime(elapsedMinutes);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '440px' }}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            <Timer size={20} style={{ color: '#818cf8' }} />
            <span>Problem Solve Timer</span>
          </h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ alignItems: 'center', padding: '2rem 1.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Track time taken while solving your DSA problem
          </span>

          <div className="stopwatch-display">
            {formatTime(seconds)}
          </div>

          <div className="stopwatch-actions">
            <button
              className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleToggle}
              style={{ minWidth: '110px' }}
            >
              {isRunning ? (
                <>
                  <Pause size={16} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>{seconds > 0 ? 'Resume' : 'Start'}</span>
                </>
              )}
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleReset}
              title="Reset stopwatch"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={handleComplete}
            style={{ width: '100%' }}
          >
            <CheckCircle size={17} />
            <span>Solved! Log This Problem ({Math.max(1, Math.round(seconds / 60))}m)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
