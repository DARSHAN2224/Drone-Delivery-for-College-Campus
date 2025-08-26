// src/stores/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from './api.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isLoggingIn: false,

      mapRole: (roleNum) => {
        switch (roleNum) {
          case 0: return "user";
          case 1: return "admin";
          case 2: return "seller";
          default: return "user";
        }
      },

      normalizeUserRole: (userData) => ({
        ...userData,
        role: get().mapRole(userData.role),
      }),

      getDeviceId: () => {
        let deviceId = localStorage.getItem("deviceId");
        if (!deviceId) {
          deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem("deviceId", deviceId);
        }
        return deviceId;
      },

      checkAuth: async () => {
        try {
          if (get().isLoggingIn) return;
          const accessToken = localStorage.getItem("accessToken");
          if (!accessToken) {
            set({ isAuthenticated: false, isLoading: false, user: null });
            return;
          }
          set({ isLoading: true });
          try {
            const storedUser = JSON.parse(localStorage.getItem("auth-storage") || "{}");
            const userRole = storedUser.state?.user?.role || storedUser.user?.role;
            let profileEndpoint = "/users/viewProfile";
            if (userRole === "seller") profileEndpoint = "/seller/viewProfile";
            else if (userRole === "admin") profileEndpoint = "/admin/viewProfile";
            const response = await api.get(profileEndpoint);
            const userData = response.data.data;
            const normalizedUser = get().normalizeUserRole(userData);
            set({ user: normalizedUser, isAuthenticated: true, isLoading: false, error: null });
          } catch (profileError) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("deviceId");
            set({ user: null, isAuthenticated: false, isLoading: false, error: "Authentication failed" });
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false, error: "Authentication check failed" });
        }
      },

      login: async (email, password, role = "user") => {
        set({ isLoading: true, error: null, isLoggingIn: true });
        try {
          const deviceId = get().getDeviceId();
          let endpoint = "/users/login";
          if (role === "seller") endpoint = "/seller/login";
          if (role === "admin") endpoint = "/admin/login";
          try { localStorage.setItem('lastLoginAttempt', JSON.stringify({ email, role })); } catch {}
          const response = await api.post(endpoint, { email, password, deviceId });
          const loginData = response?.data?.data || {};
          if (loginData.accessToken) localStorage.setItem("accessToken", loginData.accessToken);
          if (loginData.refreshToken) localStorage.setItem("refreshToken", loginData.refreshToken);
          const profileHeaders = loginData.accessToken ? { Authorization: `Bearer ${loginData.accessToken}` } : undefined;
          const profile = await api.get(endpoint.replace("/login", "/viewProfile"), profileHeaders ? { headers: profileHeaders } : undefined);
          const userData = get().normalizeUserRole(profile.data.data);
          set({ user: userData, isAuthenticated: true, isLoading: false, error: null, isLoggingIn: false });
          return { success: true, role: userData.role };
        } catch (error) {
          const status = error.response?.status;
          const data = error.response?.data || {};
          const rawMessage = data.message || "Login failed";
          const rawErrors = data.errors;
          const message = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage);
          let errorsText = '';
          if (typeof rawErrors === 'string') errorsText = rawErrors;
          else if (Array.isArray(rawErrors)) errorsText = rawErrors.map((e) => (typeof e === 'string' ? e : e?.msg || '')).join(' ');
          else if (rawErrors && typeof rawErrors === 'object') errorsText = JSON.stringify(rawErrors);
          const combined = `${message} ${errorsText}`.trim();
          set({ isLoading: false, error: combined, isLoggingIn: false });
          const notVerified = /not\s*verified/i.test(combined);
          if (status === 400 && notVerified) return { success: false, error: combined, needVerification: true };
          return { success: false, error: combined };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { name, email, mobile, password, acceptTerms, role = "user" } = userData;
          let endpoint = "/users/register";
          if (role === "seller") endpoint = "/seller/register";
          if (role === "admin") endpoint = "/admin/register";
          const requestPayload = { name, email, mobile, password, acceptTerms };
          const response = await api.post(endpoint, requestPayload);
          set({ isLoading: false, error: null });
          const verificationUrl = `/verify-email?email=${encodeURIComponent(email)}&role=${role}`;
          return { success: true, data: response.data, redirectTo: verificationUrl };
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Registration failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      verifyEmail: async (email, code, role = "user") => {
        try {
          let endpoint = "/users/verify-email";
          if (role === "seller") endpoint = "/seller/verify-email";
          if (role === "admin") endpoint = "/admin/verify-email";
          const response = await api.post(endpoint, { code });
          return { success: true, data: response.data.data };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || "Email verification failed" };
        }
      },

      resendVerificationCode: async (email, role = "user") => {
        try {
          let endpoint = "/users/resend-verification";
          if (role === "seller") endpoint = "/seller/resend-verification";
          if (role === "admin") endpoint = "/admin/resend-verification";
          const response = await api.post(endpoint, { email });
          return { success: true, data: response.data.data };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || "Failed to resend verification code" };
        }
      },

      forgotPassword: async (email, role = "user") => {
        try {
          let endpoint = "/users/forgot-password";
          if (role === "seller") endpoint = "/seller/forgot-password";
          if (role === "admin") endpoint = "/admin/forgot-password";
          const response = await api.post(endpoint, { email });
          return { success: true, data: response.data.data };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || "Failed to send password reset instructions" };
        }
      },

      resetPassword: async (token, password, confirmPassword) => {
        try {
          const response = await api.post(`/users/reset-password/${encodeURIComponent(token)}`, { password, confirmPassword });
          return { success: true, data: response.data.data };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || "Failed to reset password" };
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          if (data.name) formData.append("name", data.name);
          if (data.email) formData.append("email", data.email);
          if (data.mobile) formData.append("mobile", data.mobile);
          if (data.image) formData.append("image", data.image);
          await api.post("/users/update-profile", formData, { headers: { "Content-Type": "multipart/form-data" } });
          const profile = await api.get("/users/viewProfile");
          const userData = get().normalizeUserRole(profile.data.data);
          set({ user: userData, isLoading: false, error: null });
          return true;
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Profile update failed";
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      logout: async () => {
        try {
          const deviceId = get().getDeviceId();
          let role = get().user?.role;
          if (!role) {
            try {
              const stored = JSON.parse(localStorage.getItem("auth-storage") || "{}");
              role = stored.user?.role;
            } catch {}
          }
          let endpoint = "/users/logout";
          if (role === "seller") endpoint = "/seller/logout";
          if (role === "admin") endpoint = "/admin/logout";
          await api.post(endpoint, { deviceId });
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("deviceId");
          localStorage.removeItem("lastLoginAttempt");
          set({ user: null, isAuthenticated: false, isLoading: false, error: null, isLoggingIn: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);