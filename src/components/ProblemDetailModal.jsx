import React from 'react';
import { 
  X, 
  ExternalLink, 
  Clock, 
  Calendar, 
  Tag, 
  Lightbulb, 
  Edit3, 
  BookOpen 
} from 'lucide-react';

export default function ProblemDetailModal({
  isOpen,
  onClose,
  problem,
  onEdit
}) {
  if (!isOpen || !problem) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className={`badge ${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
            <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>
              {problem.title}
            </h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '1.25rem' }}>
          {/* External Link */}
          {problem.url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <a 
                href={problem.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', width: 'fit-content' }}
              >
                <span>Open Problem on External Site</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', background: 'var(--bg-surface-elevated)', padding: '0.9rem', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Category</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{problem.category}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Hints Needed</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8', marginTop: '0.2rem' }}>{problem.hintStatus}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Time Taken</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{problem.timeTaken} mins</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Solved On</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{formatDate(problem.date)}</div>
            </div>
          </div>

          {/* Tags */}
          {problem.tags && problem.tags.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Tags
              </div>
              <div className="problem-tags-container">
                {problem.tags.map(tag => (
                  <span key={tag} className="tag-pill" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes Content */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              <BookOpen size={14} />
              <span>Notes, Approach & Complexity</span>
            </div>
            <div 
              style={{ 
                background: 'rgba(0, 0, 0, 0.35)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: 'var(--radius-md)', 
                padding: '1rem', 
                fontSize: '0.875rem', 
                lineHeight: '1.6', 
                whiteSpace: 'pre-wrap',
                color: '#e2e8f0',
                fontFamily: 'var(--font-sans)',
                maxHeight: '260px',
                overflowY: 'auto'
              }}
            >
              {problem.notes || 'No detailed notes provided for this problem.'}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              onClose();
              onEdit(problem);
            }}
          >
            <Edit3 size={15} />
            <span>Edit Entry</span>
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
