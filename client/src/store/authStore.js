import { create } from "zustand";
import api from "../lib/api";
import toast from 'react-hot-toast'; // Import toast

const useAuthStore = create((set, get) => ({ // Re-added 'get'
  user: JSON.parse(localStorage.getItem('user')) || null, // Load user from localStorage
  isAuthenticated: !!localStorage.getItem('user'), // Check if user exists in localStorage
  loading: false,
  showLoginModal: false,

  // ✅ Load user profile from backend or local storage
  fetchUser: async () => {
    set({ loading: true });
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));

      // If we already have a locally stored demo/guest user, trust it
      if (storedUser?.isDemoUser || storedUser?._id === 'guestUser') {
        set({ user: storedUser, isAuthenticated: true });
        return;
      }

      if (storedUser && storedUser._id) {
        // If a user is already logged in (not guest), try to fetch their full profile
        const { data } = await api.get(`/api/users/${storedUser._id}`);
        const normalized = data || storedUser;
        set({ user: normalized, isAuthenticated: true });
        localStorage.setItem('user', JSON.stringify(normalized));
      } else {
        // Otherwise, fetch or create a guest profile
        const { data } = await api.get("/api/auth/profile");
        set({ user: data, isAuthenticated: true });
        localStorage.setItem('user', JSON.stringify(data)); // Store guest user
      }
    } catch (err) {
      console.error("Failed to load user:", err);
      const storedUser = JSON.parse(localStorage.getItem('user'));

      if (storedUser) {
        // Fall back to whatever we have locally so the UI stays authenticated
        set({ user: storedUser, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Update profile (name, bio, skills)
  updateUser: async (updates) => {
    set({ loading: true });
    try {
      const currentUser = get().user; // Use get() here
      if (!currentUser || !currentUser._id) {
        toast.error("No user logged in to update.");
        return;
      }
      const { data } = await api.put(`/api/auth/profile/${currentUser._id}`, updates); // Assuming profile update is by ID
      set({ user: data });
      localStorage.setItem('user', JSON.stringify(data));
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update profile.");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Login method
  login: async (userData) => {
    set({ user: userData, isAuthenticated: true, showLoginModal: false });
    localStorage.setItem('user', JSON.stringify(userData));
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, showLoginModal: true });
    localStorage.removeItem('user');
    toast.success("Logged out successfully!");
  },

  openLoginModal: () => set({ showLoginModal: true }),
  closeLoginModal: () => set({ showLoginModal: false }),
}));

export default useAuthStore;
