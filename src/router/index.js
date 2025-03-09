import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import AboutPage from "../pages/AboutPage.vue";
import ProjectsPage from "../pages/ProjectsPage.vue";
import BlogPage from "../pages/BlogPage.vue";
import BlogDetail from '../pages/BlogDetail.vue';
import SignupPage from "../pages/SignupPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import { useAuthStore } from "@/stores/auth"; // Piniaの認証ストアをインポート
import ProfilePage from "@/pages/ProfilePage.vue";
const routes = [
  { path: "/signup", name: "signup", component: SignupPage },
  { path: "/login", name: "login", component: LoginPage },
  { path: "/", name: "Home", component: HomePage },
  { path: "/about", name: "About", component: AboutPage },
  { path: "/projects", name: "Projects", component: ProjectsPage },
  { path: "/blog", name: "blog", component: BlogPage },
  { path: "/profile", name: "profile", component: ProfilePage },
  { 
    path: '/blog/:id', 
    name: 'BlogDetail', 
    component: BlogDetail, 
    props: true 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ナビゲーションガードを追加
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isLoggedIn;

  // ログインページと新規登録ページは誰でもアクセス可能
  if (to.name === "login" || to.name === "signup") {
    next();
  } else {
    // それ以外のページはログイン必須
    if (!isAuthenticated) {
      next({ name: "login" }); // 未ログインならログインページへリダイレクト
    } else {
      next(); // ログイン済みならそのまま進む
    }
  }
});

export default router;
