import React, { useState } from 'react';
import { 
  ExternalLink, 
  Clock, 
  Tag, 
  FileText, 
  Edit3, 
  Trash2, 
  LayoutGrid, 
  List, 
  Calendar, 
  Lightbulb, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';

export default function ProblemList({
  problems,
  totalCount,
  isAdmin,
  onEditProblem,
  onDeleteProblem,
  onViewDetails,
  onOpenAddModal,
  sortBy,
  setSortBy
}) {

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const getHintBadgeClass = (status) => {
    switch (status) {
      case 'No Hint':
        return 'badge-hint-nohint';
      case 'Hint':
        return 'badge-hint-hint';
      case 'Full Solution':
        return 'badge-hint-full';
      default:
        return '';
    }
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* List Meta / Header controls */}
      <div className="results-meta-bar">
        <div className="results-count">
          Showing {problems.length} of {totalCount} Problems
          {problems.length < totalCount && (
            <span>(filtered)</span>
          )}
        </div>

        <div className="view-controls">
          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sort by:</span>
            <select
              id="sort-select"
              className="filter-select"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="time-asc">Time (Fastest)</option>
              <option value="time-desc">Time (Longest)</option>
              <option value="title-asc">Title (A – Z)</option>
              <option value="difficulty">Difficulty</option>
            </select>
          </div>

          {/* Grid / Table Toggle */}
          <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-surface-elevated)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
            <button
              id="btn-view-grid"
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid card view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              id="btn-view-table"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {problems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <AlertCircle size={28} />
          </div>
          <h3>No matching problems found</h3>
          <p>
            {totalCount === 0 
              ? "You haven't logged any DSA problems yet. Click 'Log Problem' above to add your first solved problem!" 
              : "Try adjusting your filters or search keywords to find what you're looking for."}
          </p>
          {totalCount === 0 && (
            <button className="btn btn-primary" onClick={onOpenAddModal} style={{ marginTop: '0.5rem' }}>
              Log Your First Problem
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="problem-card-grid">
          {problems.map((problem) => (
            <div key={problem.id} className="problem-card" id={`problem-card-${problem.id}`}>
              {/* Header with Title and External Link */}
              <div className="problem-card-header">
                <div>
                  <a
                    href={problem.url || '#'}
                    target={problem.url ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="problem-title-link"
                    title={problem.url ? 'Open problem URL in new tab' : 'No URL provided'}
                  >
                    <span>{problem.title}</span>
                    {problem.url && <ExternalLink size={13} style={{ opacity: 0.7, flexShrink: 0 }} />}
                  </a>
                </div>

                <span className={`badge ${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </span>
              </div>

              {/* Badges row: Category & Hint Status */}
              <div className="problem-badges-row">
                <span className="badge badge-category">
                  {problem.category}
                </span>
                <span className={`badge ${getHintBadgeClass(problem.hintStatus)}`}>
                  <Lightbulb size={11} />
                  {problem.hintStatus}
                </span>
              </div>

              {/* Tags */}
              {problem.tags && problem.tags.length > 0 && (
                <div className="problem-tags-container">
                  {problem.tags.map((tag) => (
                    <span key={tag} className="tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Notes Snippet */}
              {problem.notes ? (
                <div 
                  className="notes-preview-box" 
                  onClick={() => onViewDetails(problem)}
                  title="Click to view full notes and details"
                  style={{ cursor: 'pointer' }}
                >
                  {problem.notes}
                </div>
              ) : (
                <div 
                  style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.3rem 0' }}
                >
                  No notes added.
                </div>
              )}

              {/* Card Footer: Time, Date & Actions */}
              <div className="problem-card-footer">
                <div className="meta-stats">
                  <span className="meta-item" title="Time taken to solve">
                    <Clock size={13} style={{ color: '#38bdf8' }} />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {problem.timeTaken}m
                    </span>
                  </span>

                  <span className="meta-item" title="Date solved">
                    <Calendar size={13} />
                    <span>{formatDate(problem.date)}</span>
                  </span>
                </div>

                <div className="card-action-btns">
                  <button
                    className="icon-btn"
                    onClick={() => onViewDetails(problem)}
                    title="View full notes"
                  >
                    <FileText size={15} />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        className="icon-btn"
                        onClick={() => onEditProblem(problem)}
                        title="Edit problem"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        className="icon-btn delete"
                        onClick={() => onDeleteProblem(problem.id, problem.title)}
                        title="Delete entry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="table-container">
          <table className="problems-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Category</th>
                <th>Tags</th>
                <th>Hints</th>
                <th>Time</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr key={problem.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <a
                        href={problem.url || '#'}
                        target={problem.url ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="problem-title-link"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {problem.title}
                        {problem.url && <ExternalLink size={12} />}
                      </a>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${problem.difficulty.toLowerCase()}`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-category" style={{ fontSize: '0.72rem' }}>
                      {problem.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxWidth: '200px' }}>
                      {problem.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="tag-pill" style={{ fontSize: '0.68rem' }}>
                          {tag}
                        </span>
                      ))}
                      {problem.tags?.length > 3 && (
                        <span className="tag-pill" style={{ fontSize: '0.68rem' }}>
                          +{problem.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getHintBadgeClass(problem.hintStatus)}`} style={{ fontSize: '0.72rem' }}>
                      {problem.hintStatus}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8' }}>
                      {problem.timeTaken}m
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {formatDate(problem.date)}
                  </td>
                  <td>
                    <div className="card-action-btns" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="icon-btn"
                        onClick={() => onViewDetails(problem)}
                        title="View details & notes"
                      >
                        <FileText size={15} />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            className="icon-btn"
                            onClick={() => onEditProblem(problem)}
                            title="Edit problem"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="icon-btn delete"
                            onClick={() => onDeleteProblem(problem.id, problem.title)}
                            title="Delete entry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
