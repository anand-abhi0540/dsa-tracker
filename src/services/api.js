const STORAGE_KEY = 'algopulse_dsa_problems';

export const api = {
  // Fetch all problems
  async getProblems() {
    try {
      const res = await fetch('/api/problems');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      // Sync to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (err) {
      console.warn('API getProblems failed (static mode / GitHub Pages), falling back to localStorage/static file:', err);
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        try {
          return JSON.parse(local);
        } catch {
          // continue to fetch fallback
        }
      }

      // On first load on GitHub Pages, load static public/dsa-tracker.json
      try {
        const staticRes = await fetch('./dsa-tracker.json');
        if (staticRes.ok) {
          const staticData = await staticRes.json();
          if (Array.isArray(staticData)) {
            const normalized = staticData.map(p => ({
              ...p,
              category: p.category || p.topic || 'Array',
              timeTaken: Number(p.timeTaken ?? p.minutes ?? 0),
              hintStatus: p.hintStatus || p.help || 'No Hint',
              tags: p.tags || (p.topic ? [p.topic] : [])
            }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
            return normalized;
          }
        }
      } catch (staticErr) {
        console.warn('Static file fetch failed:', staticErr);
      }

      return [];
    }
  },


  // Create a new problem
  async createProblem(problemData) {
    try {
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problemData),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const created = await res.json();
      
      // Update local storage backup
      const current = await this.getProblems();
      return created;
    } catch (err) {
      console.warn('API createProblem failed, saving to localStorage only:', err);
      const local = localStorage.getItem(STORAGE_KEY);
      const problems = local ? JSON.parse(local) : [];
      const newEntry = {
        ...problemData,
        id: problemData.id || `prob-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      const updated = [newEntry, ...problems];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newEntry;
    }
  },

  // Update a problem
  async updateProblem(id, updates) {
    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updatedItem = await res.json();
      await this.getProblems(); // resync
      return updatedItem;
    } catch (err) {
      console.warn('API updateProblem failed, updating localStorage only:', err);
      const local = localStorage.getItem(STORAGE_KEY);
      const problems = local ? JSON.parse(local) : [];
      const index = problems.findIndex(p => String(p.id) === String(id));
      if (index !== -1) {
        problems[index] = { ...problems[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
        return problems[index];
      }
      throw new Error('Problem not found');
    }
  },

  // Delete a problem
  async deleteProblem(id) {
    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result = await res.json();
      await this.getProblems(); // resync
      return result;
    } catch (err) {
      console.warn('API deleteProblem failed, deleting from localStorage only:', err);
      const local = localStorage.getItem(STORAGE_KEY);
      const problems = local ? JSON.parse(local) : [];
      const filtered = problems.filter(p => String(p.id) !== String(id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return { success: true, id };
    }
  },

  // Bulk import
  async importProblems(problemsList) {
    try {
      const res = await fetch('/api/problems/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problemsList),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result = await res.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(problemsList));
      return result;
    } catch (err) {
      console.warn('API importProblems failed, storing to localStorage:', err);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(problemsList));
      return { success: true, count: problemsList.length, problems: problemsList };
    }
  },

  // Export as downloaded JSON file
  exportToJsonFile(problems) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(problems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dsa-tracker.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

};
