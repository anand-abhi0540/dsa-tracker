import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Lightbulb, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';

export default function StatsDashboard({ problems }) {
  const total = problems.length;

  const easyCount = problems.filter(p => p.difficulty === 'Easy').length;
  const mediumCount = problems.filter(p => p.difficulty === 'Medium').length;
  const hardCount = problems.filter(p => p.difficulty === 'Hard').length;

  const easyPercent = total ? Math.round((easyCount / total) * 100) : 0;
  const mediumPercent = total ? Math.round((mediumCount / total) * 100) : 0;
  const hardPercent = total ? Math.round((hardCount / total) * 100) : 0;

  // Hint metrics
  const noHintCount = problems.filter(p => p.hintStatus === 'No Hint').length;
  const hintCount = problems.filter(p => p.hintStatus === 'Hint').length;
  const fullSolCount = problems.filter(p => p.hintStatus === 'Full Solution').length;
  const independenceScore = total ? Math.round((noHintCount / total) * 100) : 0;

  // Average time
  const totalTime = problems.reduce((acc, p) => acc + (Number(p.timeTaken) || 0), 0);
  const avgTime = total ? Math.round(totalTime / total) : 0;

  // Today count
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = problems.filter(p => p.date === todayStr).length;

  return (
    <div className="dashboard-grid">
      {/* Total Solved Card */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Solved</span>
          <div className="stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="stat-value">{total}</div>
        <div className="stat-footer">
          <span>{todayCount} solved today</span>
        </div>
      </div>

      {/* Difficulty Breakdown Card */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Difficulty Breakdown</span>
          <div className="stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="difficulty-bars">
          <div className="diff-row">
            <span className="diff-name easy">Easy</span>
            <div className="diff-track">
              <div className="diff-fill easy" style={{ width: `${easyPercent}%` }}></div>
            </div>
            <span className="diff-count">{easyCount}</span>
          </div>
          <div className="diff-row">
            <span className="diff-name medium">Med</span>
            <div className="diff-track">
              <div className="diff-fill medium" style={{ width: `${mediumPercent}%` }}></div>
            </div>
            <span className="diff-count">{mediumCount}</span>
          </div>
          <div className="diff-row">
            <span className="diff-name hard">Hard</span>
            <div className="diff-track">
              <div className="diff-fill hard" style={{ width: `${hardPercent}%` }}></div>
            </div>
            <span className="diff-count">{hardCount}</span>
          </div>
        </div>
      </div>

      {/* Independence Score Card */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Independence Rate</span>
          <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Lightbulb size={18} />
          </div>
        </div>
        <div className="stat-value" style={{ color: '#34d399' }}>
          {independenceScore}%
        </div>
        <div className="stat-footer">
          <span>{noHintCount} solved without any hints</span>
        </div>
      </div>

      {/* Average Solve Time Card */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Avg. Solve Time</span>
          <div className="stat-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Clock size={18} />
          </div>
        </div>
        <div className="stat-value">
          {avgTime} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>min</span>
        </div>
        <div className="stat-footer">
          <span>Total DSA focus: {Math.round(totalTime / 60 * 10) / 10} hrs</span>
        </div>
      </div>
    </div>
  );
}
