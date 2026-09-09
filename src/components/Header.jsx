import React, { useRef } from 'react';
import { 
  Code2, 
  Flame, 
  Plus, 
  Timer, 
  Download, 
  Upload, 
  Database 
} from 'lucide-react';

export default function Header({ 
  streakCount, 
  onOpenAddModal, 
  onOpenStopwatch, 
  onExportJson, 
  onImportJson 
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          onImportJson(parsed);
        } else {
          alert('Import failed: JSON file must contain an array of problems.');
        }
      } catch (err) {
        alert('Invalid JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  return (
    <header className="header">
      <div className="brand-section">
        <div className="logo-badge">
          <Code2 size={24} />
        </div>
        <div>
          <h1 className="brand-title">
            AlgoPulse
            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              DSA TRACKER
            </span>
          </h1>
          <p className="brand-subtitle">Master algorithms, persist daily progress</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Daily Streak Indicator */}
        <div className="streak-chip" title={`${streakCount} day streak of solving DSA problems`}>
          <Flame size={18} className="flame-icon" />
          <span>{streakCount} {streakCount === 1 ? 'Day Streak' : 'Days Streak'}</span>
        </div>

        {/* Solve Timer */}
        <button 
          id="btn-solve-timer"
          className="btn btn-secondary" 
          onClick={onOpenStopwatch}
          title="Open live solve timer"
        >
          <Timer size={16} />
          <span>Solve Timer</span>
        </button>

        {/* Export JSON */}
        <button 
          id="btn-export-json"
          className="btn btn-secondary" 
          onClick={onExportJson}
          title="Export problems as JSON file"
        >
          <Download size={16} />
          <span>Export JSON</span>
        </button>

        {/* Import JSON */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".json,application/json"
          onChange={handleFileChange}
        />
        <button 
          id="btn-import-json"
          className="btn btn-secondary" 
          onClick={() => fileInputRef.current?.click()}
          title="Import problems from JSON file"
        >
          <Upload size={16} />
          <span>Import</span>
        </button>

        {/* Add Problem Button */}
        <button 
          id="btn-add-problem"
          className="btn btn-primary" 
          onClick={onOpenAddModal}
        >
          <Plus size={18} />
          <span>Log Problem</span>
        </button>
      </div>
    </header>
  );
}
