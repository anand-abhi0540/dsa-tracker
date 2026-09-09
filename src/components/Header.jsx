import React, { useRef } from 'react';
import { 
  Code2, 
  Flame, 
  Plus, 
  Timer, 
  Download, 
  Upload, 
  Lock, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react';

export default function Header({ 
  streakCount, 
  isAdmin,
  onOpenLoginModal,
  onLogout,
  onOpenAddModal, 
  onOpenStopwatch, 
  onExportJson, 
  onImportJson 
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (!isAdmin) {
      onOpenLoginModal();
      return;
    }
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

  const handleAddClick = () => {
    if (isAdmin) {
      onOpenAddModal();
    } else {
      onOpenLoginModal();
    }
  };

  const handleImportClick = () => {
    if (isAdmin) {
      fileInputRef.current?.click();
    } else {
      onOpenLoginModal();
    }
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
          onClick={handleImportClick}
          title={isAdmin ? "Import problems from JSON file" : "Admin login required to import"}
        >
          <Upload size={16} />
          <span>Import</span>
        </button>

        {/* Admin Login / Logout status */}
        {isAdmin ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span 
              className="badge" 
              style={{ 
                background: 'rgba(16, 185, 129, 0.15)', 
                color: '#34d399', 
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '0.45rem 0.65rem'
              }}
              title="Admin authenticated: You can add, edit, and delete problems"
            >
              <ShieldCheck size={14} />
              <span>Admin</span>
            </span>
            <button 
              id="btn-logout"
              className="btn btn-ghost" 
              onClick={onLogout}
              title="Log out of Admin mode"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button 
            id="btn-open-login"
            className="btn btn-secondary" 
            onClick={onOpenLoginModal}
            title="Unlock admin permissions to add or edit problems"
          >
            <Lock size={15} />
            <span>Admin Login</span>
          </button>
        )}

        {/* Add Problem Button */}
        <button 
          id="btn-add-problem"
          className="btn btn-primary" 
          onClick={handleAddClick}
          title={isAdmin ? "Log a new solved problem" : "Admin login required to log problems"}
        >
          {isAdmin ? <Plus size={18} /> : <Lock size={15} />}
          <span>Log Problem</span>
        </button>
      </div>
    </header>
  );
}
