import { defineStore } from "pinia";
import axios from "axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isLoggedIn: !!localStorage.getItem("token"), // リロード後もログイン状態を保持
    token: localStorage.getItem("token") || null,
  }),
  actions: {
    async login(credentials) {
      try {
        const response = await axios.post("/api/login", credentials);
        this.token = response.data.token;
        this.isLoggedIn = true;
        localStorage.setItem("token", response.data.token);
      } catch (error) {
        throw new Error("ログインに失敗しました");
      }
    },
    logout() {
      this.token = null;
      this.isLoggedIn = false;
      localStorage.removeItem("token");
    },
    checkLoginStatus() {
      const token = localStorage.getItem("token");
      this.isLoggedIn = !!token;
      this.token = token || null;
    },
  },
  persist: true, // Pinia の状態を永続化
});
