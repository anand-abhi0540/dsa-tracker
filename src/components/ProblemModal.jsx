import React, { useState, useEffect } from 'react';
import { 
  X, 
  Tag, 
  Link, 
  Clock, 
  FileText, 
  HelpCircle, 
  FolderPlus, 
  Plus 
} from 'lucide-react';
import { 
  DSA_CATEGORIES, 
  POPULAR_TAGS, 
  HINT_OPTIONS, 
  DIFFICULTY_OPTIONS 
} from '../constants/dsaTopics';

export default function ProblemModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  presetTime = null
}) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    difficulty: 'Medium',
    category: 'Array',
    customCategory: '',
    tags: [],
    tagInput: '',
    timeTaken: 20,
    hintStatus: 'No Hint',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        url: initialData.url || '',
        difficulty: initialData.difficulty || 'Medium',
        category: DSA_CATEGORIES.includes(initialData.category) ? initialData.category : 'Other',
        customCategory: DSA_CATEGORIES.includes(initialData.category) ? '' : (initialData.category || ''),
        tags: Array.isArray(initialData.tags) ? initialData.tags : [],
        tagInput: '',
        timeTaken: initialData.timeTaken ?? 20,
        hintStatus: initialData.hintStatus || 'No Hint',
        notes: initialData.notes || '',
        date: initialData.date || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        title: '',
        url: '',
        difficulty: 'Medium',
        category: 'Array',
        customCategory: '',
        tags: ['Array'],
        tagInput: '',
        timeTaken: presetTime !== null ? presetTime : 20,
        hintStatus: 'No Hint',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
  }, [initialData, presetTime, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (tagToAdd) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (!formData.tags.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmed],
        tagInput: ''
      }));
    } else {
      setFormData(prev => ({ ...prev, tagInput: '' }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(formData.tagInput);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Problem title is required';
    }

    const resolvedCategory = formData.category === 'Other' 
      ? (formData.customCategory.trim() || 'General') 
      : formData.category;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const problemPayload = {
      title: formData.title.trim(),
      url: formData.url.trim(),
      difficulty: formData.difficulty,
      category: resolvedCategory,
      tags: formData.tags,
      timeTaken: Number(formData.timeTaken) || 0,
      hintStatus: formData.hintStatus,
      notes: formData.notes.trim(),
      date: formData.date
    };

    onSubmit(problemPayload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {initialData ? 'Edit Problem Entry' : 'Log Solved DSA Problem'}
          </h2>
          <button 
            id="btn-close-modal"
            className="icon-btn" 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Form */}
        <form id="problem-form" onSubmit={handleSubmit} className="modal-body">
          {/* Title & URL */}
          <div className="form-field">
            <label className="form-label" htmlFor="problem-title-input">
              Problem Title <span style={{ color: 'var(--hard)' }}>*</span>
            </label>
            <input
              id="problem-title-input"
              type="text"
              className="form-input"
              placeholder="e.g. Course Schedule II, Binary Tree Maximum Path Sum"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              autoFocus
            />
            {errors.title && (
              <span style={{ fontSize: '0.75rem', color: 'var(--hard)' }}>{errors.title}</span>
            )}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="problem-url-input">
              Problem URL
            </label>
            <input
              id="problem-url-input"
              type="url"
              className="form-input"
              placeholder="https://leetcode.com/problems/..."
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            />
          </div>

          {/* Difficulty Selector */}
          <div className="form-field">
            <label className="form-label">Difficulty</label>
            <div className="difficulty-selector">
              {DIFFICULTY_OPTIONS.map((diff) => (
                <button
                  key={diff.value}
                  type="button"
                  id={`btn-select-diff-${diff.value.toLowerCase()}`}
                  className={`diff-radio-btn ${formData.difficulty === diff.value ? 'selected-' + diff.value : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, difficulty: diff.value }))}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Date Grid */}
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label" htmlFor="problem-category-select">
                Primary Category
              </label>
              <select
                id="problem-category-select"
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                {DSA_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">+ Custom Category...</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="problem-date-input">
                Date Solved
              </label>
              <input
                id="problem-date-input"
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>

          {formData.category === 'Other' && (
            <div className="form-field">
              <label className="form-label" htmlFor="problem-custom-category-input">
                Specify Custom Category
              </label>
              <input
                id="problem-custom-category-input"
                type="text"
                className="form-input"
                placeholder="e.g. Segment Tree, Fenwick Tree, Game Theory"
                value={formData.customCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
              />
            </div>
          )}

          {/* Time Taken & Hint Status */}
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label" htmlFor="problem-time-input">
                Time Taken (minutes)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="problem-time-input"
                  type="number"
                  min="1"
                  max="1440"
                  className="form-input"
                  value={formData.timeTaken}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeTaken: e.target.value }))}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  mins
                </span>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Hints Needed to Solve</label>
              <select
                id="problem-hint-select"
                className="form-select"
                value={formData.hintStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, hintStatus: e.target.value }))}
              >
                <option value="No Hint">No Hint (Solved 100% Independently)</option>
                <option value="Hint">Hint (Used clue, hint or discussion glance)</option>
                <option value="Full Solution">Full Solution (Read complete editorial)</option>
              </select>
            </div>
          </div>

          {/* LeetCode Style Tags */}
          <div className="form-field">
            <label className="form-label">
              LeetCode-style Tags
            </label>
            <div className="tags-picker-box">
              {/* Selected tags */}
              <div className="selected-tags-chips">
                {formData.tags.length === 0 ? (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '2px 6px' }}>
                    No tags selected yet. Type below or click popular suggestions.
                  </span>
                ) : (
                  formData.tags.map(tag => (
                    <span key={tag} className="selected-tag-item">
                      #{tag}
                      <X 
                        size={12} 
                        className="tag-remove-x" 
                        onClick={() => handleRemoveTag(tag)} 
                      />
                    </span>
                  ))
                )}
              </div>

              {/* Tag input */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="problem-tag-input"
                  type="text"
                  className="form-input"
                  placeholder="Type a tag and press Enter or click '+ Add'..."
                  value={formData.tagInput}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                  onKeyDown={handleTagKeyDown}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleAddTag(formData.tagInput)}
                >
                  <Plus size={15} />
                  Add
                </button>
              </div>

              {/* Popular tags suggestions */}
              <div className="suggested-tags-wrapper">
                {POPULAR_TAGS.map(tag => {
                  const isSelected = formData.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`suggested-tag-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => isSelected ? handleRemoveTag(tag) : handleAddTag(tag)}
                    >
                      {isSelected ? '✓ ' : '+ '}{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notes & Complexity */}
          <div className="form-field">
            <label className="form-label" htmlFor="problem-notes-input">
              Notes, Approach & Complexity
            </label>
            <textarea
              id="problem-notes-input"
              className="form-textarea"
              placeholder="e.g. Key idea, two pointer invariant, edge case with empty array, Time: O(n log n), Space: O(1)..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="problem-form"
            id="btn-submit-problem"
            className="btn btn-primary"
          >
            {initialData ? 'Save Changes' : 'Log Problem Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}
