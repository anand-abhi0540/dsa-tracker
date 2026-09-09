const AUTH_STORAGE_KEY = 'algopulse_admin_auth';

export const authService = {
  // Check if currently authenticated as admin
  isAuthenticated() {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  },

  // Validate entered password against configured VITE_ADMIN_PASSWORD
  login(inputPassword) {
    const configuredPassword = (import.meta.env.VITE_ADMIN_PASSWORD || 'admin123').trim();
    const provided = (inputPassword || '').trim();

    if (provided === configuredPassword) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      return { success: true };
    }

    return { 
      success: false, 
      error: 'Invalid password. Please enter the password configured in your .env file.' 
    };
  },

  // Log out of admin mode
  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return { success: true };
  }
};
