<template>
  <header class="header">
    <div class="logo">JobQuest</div>
    <nav class="nav" :class="{ 'active': menuOpen }">
      <div class="nav-group">
        <ul class="auth-links">
          <li v-if="!authStore.isLoggedIn">
            <router-link to="/login"><v-btn class="auth-btn">Login</v-btn></router-link>
          </li>
          <li v-if="!authStore.isLoggedIn">
            <router-link to="/signup"><v-btn class="auth-btn">Sign Up</v-btn></router-link>
          </li>
        </ul>
        <ul class="main-links">
          <li><router-link to="/">ダッシュボード</router-link></li>
          <li><router-link to="/projects">エントリー画面</router-link></li>
          <li><router-link to="/about">面接記録</router-link></li>
          <li><router-link to="/blog">分析</router-link></li>
          <li><router-link to="/profile">プロフィール</router-link></li>
        </ul>
      </div>
    </nav>

    <!-- メニューアイコン（ハンバーガーメニュー） -->
    <div class="menu-icon" @click="toggleMenu">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </header>
</template>

<script>
import { defineComponent } from "vue";
import { useAuthStore } from "@/stores/auth";

export default defineComponent({
  data() {
    return {
      menuOpen: false,
    };
  },
  computed: {
    authStore() {
      return useAuthStore();
    },
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
  },
});
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 60px;
  background: linear-gradient(to right, #ff0000, #ff0000);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
  color: #fff;
}

.nav {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-group {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.auth-links,
.main-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}

.auth-links {
  margin-right: auto;
}

.auth-btn {
  background-color: #fff;
  color: #ff0000;
  font-weight: bold;
}

.nav a {
  text-decoration: none;
  color: white;
  font-weight: bold;
  transition: color 0.3s ease-in-out;
}

.nav a:hover {
  color: #ffcc00;
}

.menu-icon {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 25px;
  cursor: pointer;
  position: absolute;
  right: 20px;
  top: 15px;
}

.menu-icon span {
  width: 100%;
  height: 4px;
  background-color: white;
  border-radius: 2px;
  transition: transform 0.3s ease-in-out;
}

@media (max-width: 768px) {
  .menu-icon {
    display: flex;
  }

  .nav {
    display: none;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 60px;
    left: 0;
    width: 100%;
    background-color: #ff0000;
    z-index: 999;
    padding: 1rem 0;
  }

  .nav.active {
    display: flex;
  }

  .nav-group {
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .auth-links,
  .main-links {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
