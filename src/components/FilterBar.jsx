import React from 'react';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  RotateCcw,
  Tag,
  Clock,
  HelpCircle,
  FolderGit2
} from 'lucide-react';
import { DSA_CATEGORIES, HINT_OPTIONS } from '../constants/dsaTopics';

export default function FilterBar({
  filters,
  setFilters,
  allAvailableTags,
  allAvailableCategories,
  onResetFilters
}) {
  const hasActiveFilters = 
    filters.search.trim() !== '' ||
    filters.difficulty !== 'ALL' ||
    filters.category !== 'ALL' ||
    filters.hintStatus !== 'ALL' ||
    filters.timeTaken !== 'ALL' ||
    filters.dateRange !== 'ALL' ||
    filters.selectedTags.length > 0;

  const handleDifficultyClick = (diff) => {
    setFilters(prev => ({
      ...prev,
      difficulty: prev.difficulty === diff ? 'ALL' : diff
    }));
  };

  const handleTagToggle = (tag) => {
    setFilters(prev => {
      const exists = prev.selectedTags.includes(tag);
      return {
        ...prev,
        selectedTags: exists
          ? prev.selectedTags.filter(t => t !== tag)
          : [...prev.selectedTags, tag]
      };
    });
  };

  const removeTag = (tag) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.filter(t => t !== tag)
    }));
  };

  return (
    <div className="filter-panel">
      {/* Top Search & Reset Row */}
      <div className="filter-top-row">
        {/* Search by Title / URL */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            id="filter-search-input"
            type="text"
            className="search-input"
            placeholder="Search problems by title, problem URL, or concept..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          {filters.search && (
            <button 
              className="icon-btn" 
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button 
            id="btn-reset-filters"
            className="btn btn-ghost" 
            onClick={onResetFilters}
            style={{ color: '#f87171' }}
          >
            <RotateCcw size={15} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Structured Multi-Criteria Filters Row */}
      <div className="filter-controls-row">
        {/* Difficulty Filter */}
        <div className="filter-group">
          <label className="filter-label">Difficulty</label>
          <div className="difficulty-pill-group">
            {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                id={`filter-diff-${diff.toLowerCase()}`}
                type="button"
                className={`diff-pill-btn ${filters.difficulty === diff ? 'active ' + diff.toLowerCase() : ''}`}
                onClick={() => handleDifficultyClick(diff)}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-category-select">
            Category
          </label>
          <select
            id="filter-category-select"
            className="filter-select"
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="ALL">All Categories</option>
            {allAvailableCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Hint Status Filter */}
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-hint-select">
            Hints Needed
          </label>
          <select
            id="filter-hint-select"
            className="filter-select"
            value={filters.hintStatus}
            onChange={(e) => setFilters(prev => ({ ...prev, hintStatus: e.target.value }))}
          >
            <option value="ALL">All Hint States</option>
            <option value="No Hint">No Hint (Independent)</option>
            <option value="Hint">Needed Hint</option>
            <option value="Full Solution">Full Solution Used</option>
          </select>
        </div>

        {/* Time Taken Filter */}
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-time-select">
            Time Taken
          </label>
          <select
            id="filter-time-select"
            className="filter-select"
            value={filters.timeTaken}
            onChange={(e) => setFilters(prev => ({ ...prev, timeTaken: e.target.value }))}
          >
            <option value="ALL">Any Time</option>
            <option value="quick">&lt; 15 mins (Speed)</option>
            <option value="moderate">15 – 30 mins</option>
            <option value="deep">30 – 45 mins</option>
            <option value="marathon">&gt; 45 mins</option>
          </select>
        </div>

        {/* Date Solved Filter */}
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-date-select">
            Date Solved
          </label>
          <select
            id="filter-date-select"
            className="filter-select"
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
          >
            <option value="ALL">All Time</option>
            <option value="today">Today</option>
            <option value="last7">Last 7 Days</option>
            <option value="thisMonth">This Month</option>
          </select>
        </div>

        {/* Tag Filter Dropdown */}
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-tag-select">
            Add Tag Filter
          </label>
          <select
            id="filter-tag-select"
            className="filter-select"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                handleTagToggle(e.target.value);
              }
            }}
          >
            <option value="">+ Filter by Tag...</option>
            {allAvailableTags
              .filter(tag => !filters.selectedTags.includes(tag))
              .map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))
            }
          </select>
        </div>
      </div>

      {/* Selected Tags Chips Row */}
      {filters.selectedTags.length > 0 && (
        <div className="active-tags-row">
          <span className="tag-label-small">Filtering by Tags:</span>
          {filters.selectedTags.map(tag => (
            <span 
              key={tag} 
              className="filter-tag-chip" 
              onClick={() => removeTag(tag)}
              title="Click to remove tag filter"
            >
              <Tag size={12} />
              <span>{tag}</span>
              <X size={12} />
            </span>
          ))}
          <button 
            className="btn-ghost" 
            style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem', color: 'var(--text-muted)' }}
            onClick={() => setFilters(prev => ({ ...prev, selectedTags: [] }))}
          >
            Clear tags
          </button>
        </div>
      )}
    </div>
  );
}
