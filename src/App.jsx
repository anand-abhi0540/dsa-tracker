import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { api } from './services/api';
import Header from './components/Header';
import StatsDashboard from './components/StatsDashboard';
import FilterBar from './components/FilterBar';
import ProblemList from './components/ProblemList';
import ProblemModal from './components/ProblemModal';
import ProblemDetailModal from './components/ProblemDetailModal';
import StopwatchModal from './components/StopwatchModal';
import { DSA_CATEGORIES, POPULAR_TAGS } from './constants/dsaTopics';

export default function App() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [detailProblem, setDetailProblem] = useState(null);
  const [isStopwatchOpen, setIsStopwatchOpen] = useState(false);
  const [presetTime, setPresetTime] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    difficulty: 'ALL',
    category: 'ALL',
    hintStatus: 'ALL',
    timeTaken: 'ALL',
    dateRange: 'ALL',
    selectedTags: []
  });

  // Sorting state
  const [sortBy, setSortBy] = useState('date-desc');

  // Load problems on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getProblems();
        setProblems(data);
      } catch (err) {
        console.error('Failed to load problems:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute daily streak
  const streakCount = useMemo(() => {
    if (!problems.length) return 0;
    
    // Get unique sorted dates in YYYY-MM-DD
    const dates = Array.from(new Set(problems.map(p => p.date).filter(Boolean))).sort().reverse();
    if (!dates.length) return 0;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if user solved today or yesterday to maintain active streak
    let streak = 0;
    let checkDate = new Date(today);

    if (dates.includes(todayStr)) {
      // solved today, start counting from today
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dates.includes(yesterdayStr)) {
      // solved yesterday, streak is currently active
      streak = 1;
      checkDate = new Date(yesterday);
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      return 0; // streak broken
    }

    // Continue counting backwards
    while (true) {
      const prevDateStr = checkDate.toISOString().split('T')[0];
      if (dates.includes(prevDateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [problems]);

  // Aggregate unique categories and tags across data + presets
  const allAvailableCategories = useMemo(() => {
    const fromProblems = problems.map(p => p.category).filter(Boolean);
    return Array.from(new Set([...DSA_CATEGORIES, ...fromProblems])).sort();
  }, [problems]);

  const allAvailableTags = useMemo(() => {
    const fromProblems = problems.flatMap(p => p.tags || []).filter(Boolean);
    return Array.from(new Set([...POPULAR_TAGS, ...fromProblems])).sort();
  }, [problems]);

  // Filter and sort problems
  const filteredProblems = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];

    const startOfMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;

    return problems.filter(item => {
      // 1. Search (title, url, tags, category)
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesUrl = item.url?.toLowerCase().includes(query);
        const matchesCat = item.category?.toLowerCase().includes(query);
        const matchesTags = item.tags?.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesUrl && !matchesCat && !matchesTags) {
          return false;
        }
      }

      // 2. Difficulty
      if (filters.difficulty !== 'ALL' && item.difficulty !== filters.difficulty) {
        return false;
      }

      // 3. Category
      if (filters.category !== 'ALL' && item.category !== filters.category) {
        return false;
      }

      // 4. Hint Status
      if (filters.hintStatus !== 'ALL' && item.hintStatus !== filters.hintStatus) {
        return false;
      }

      // 5. Time Taken
      if (filters.timeTaken !== 'ALL') {
        const time = Number(item.timeTaken) || 0;
        if (filters.timeTaken === 'quick' && time >= 15) return false;
        if (filters.timeTaken === 'moderate' && (time < 15 || time > 30)) return false;
        if (filters.timeTaken === 'deep' && (time < 31 || time > 45)) return false;
        if (filters.timeTaken === 'marathon' && time <= 45) return false;
      }

      // 6. Date Range
      if (filters.dateRange !== 'ALL') {
        const pDate = item.date || '';
        if (filters.dateRange === 'today' && pDate !== todayStr) return false;
        if (filters.dateRange === 'last7' && (pDate < sevenDaysStr || pDate > todayStr)) return false;
        if (filters.dateRange === 'thisMonth' && (pDate < startOfMonthStr || pDate > todayStr)) return false;
      }

      // 7. Tags (must include all selected tags)
      if (filters.selectedTags.length > 0) {
        const itemTags = item.tags || [];
        const hasAllTags = filters.selectedTags.every(t => itemTags.includes(t));
        if (!hasAllTags) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        return (b.date || '').localeCompare(a.date || '') || (b.id || '').localeCompare(a.id || '');
      }
      if (sortBy === 'date-asc') {
        return (a.date || '').localeCompare(b.date || '') || (a.id || '').localeCompare(b.id || '');
      }
      if (sortBy === 'time-asc') {
        return (Number(a.timeTaken) || 0) - (Number(b.timeTaken) || 0);
      }
      if (sortBy === 'time-desc') {
        return (Number(b.timeTaken) || 0) - (Number(a.timeTaken) || 0);
      }
      if (sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'difficulty') {
        const order = { Easy: 1, Medium: 2, Hard: 3 };
        return (order[a.difficulty] || 2) - (order[b.difficulty] || 2);
      }
      return 0;
    });
  }, [problems, filters, sortBy]);

  // Handlers for Add / Edit
  const handleSaveProblem = async (problemData) => {
    try {
      if (editingProblem) {
        const updated = await api.updateProblem(editingProblem.id, problemData);
        setProblems(prev => prev.map(p => p.id === editingProblem.id ? updated : p));
        setEditingProblem(null);
      } else {
        const created = await api.createProblem(problemData);
        setProblems(prev => [created, ...prev]);
        // Trigger celebratory confetti for logging a problem!
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#38bdf8']
        });
      }
      setIsAddModalOpen(false);
      setPresetTime(null);
    } catch (err) {
      alert('Failed to save problem: ' + err.message);
    }
  };

  const handleDeleteProblem = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    try {
      await api.deleteProblem(id);
      setProblems(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete problem: ' + err.message);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      difficulty: 'ALL',
      category: 'ALL',
      hintStatus: 'ALL',
      timeTaken: 'ALL',
      dateRange: 'ALL',
      selectedTags: []
    });
  };

  const handleExportJson = () => {
    api.exportToJsonFile(problems);
  };

  const handleImportJson = async (importedList) => {
    if (window.confirm(`Importing ${importedList.length} problems will merge or replace current entries. Proceed?`)) {
      try {
        await api.importProblems(importedList);
        setProblems(importedList);
        alert(`Successfully imported ${importedList.length} problems!`);
      } catch (err) {
        alert('Failed to import: ' + err.message);
      }
    }
  };

  const handleStopwatchFinish = (minutes) => {
    setPresetTime(minutes);
    setIsAddModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Header
        streakCount={streakCount}
        onOpenAddModal={() => {
          setEditingProblem(null);
          setPresetTime(null);
          setIsAddModalOpen(true);
        }}
        onOpenStopwatch={() => setIsStopwatchOpen(true)}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />

      {/* Stats Dashboard */}
      <StatsDashboard problems={problems} />

      {/* Multi-Criteria Filter Bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        allAvailableTags={allAvailableTags}
        allAvailableCategories={allAvailableCategories}
        onResetFilters={handleResetFilters}
      />

      {/* Main Problems List */}
      <ProblemList
        problems={filteredProblems}
        totalCount={problems.length}
        onEditProblem={(prob) => {
          setEditingProblem(prob);
          setIsAddModalOpen(true);
        }}
        onDeleteProblem={handleDeleteProblem}
        onViewDetails={(prob) => setDetailProblem(prob)}
        onOpenAddModal={() => {
          setEditingProblem(null);
          setPresetTime(null);
          setIsAddModalOpen(true);
        }}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Problem Entry Modal (Add / Edit) */}
      <ProblemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProblem(null);
          setPresetTime(null);
        }}
        onSubmit={handleSaveProblem}
        initialData={editingProblem}
        presetTime={presetTime}
      />

      {/* Problem Notes & Details Modal */}
      <ProblemDetailModal
        isOpen={!!detailProblem}
        onClose={() => setDetailProblem(null)}
        problem={detailProblem}
        onEdit={(prob) => {
          setEditingProblem(prob);
          setIsAddModalOpen(true);
        }}
      />

      {/* Live Solve Timer Modal */}
      <StopwatchModal
        isOpen={isStopwatchOpen}
        onClose={() => setIsStopwatchOpen(false)}
        onFinishWithTime={handleStopwatchFinish}
      />
    </div>
  );
}
