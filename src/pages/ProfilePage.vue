<template>
    <v-container>
      <v-card class="profile-card" elevation="10">
        <v-card-title class="text-h5">プロフィール</v-card-title>
        <v-card-text>
          <div class="profile-info">
            <v-list>
              <v-list-item>
                <v-list-item-title>名前</v-list-item-title>
                <v-list-item-subtitle>{{ user.name }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>メールアドレス</v-list-item-title>
                <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn  @click="logout">ログアウト</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </template>
  
  <script>
  import { useAuthStore } from "@/stores/auth";
  import axios from "axios";
  
  export default {
    data() {
      return {
        user: { name: "", email: "", createdAt: "" },
      };
    },
    computed: {
      authStore() {
        return useAuthStore();
      },
    },
    async mounted() {
      await this.fetchUserData();
    },
    methods: {
        async fetchUserData() {
            try {
                const token = this.authStore.token; // Piniaのストアからトークンを取得
                if (!token) {
                    console.error("トークンが存在しません");
                    alert("認証情報がありません。ログインしてください。");
                    return;
                }

                const { data } = await axios.get("/api/me", {
                    headers: {
                        Authorization: `Bearer ${token}`, // トークンをヘッダーに追加
                    },
                });

                this.user = data; // 取得したデータを user にセット
            } catch (err) {
                console.error("ユーザー情報の取得に失敗しました:", err);
                alert("ユーザー情報の取得に失敗しました。");
            }
        },
        logout() {
            this.authStore.logout();
            this.$router.push("/login");
            console.log("ログアウトしました");
        },
    },
  };
  </script>
  
  <style scoped>
  .profile-card {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border-radius: 10px;
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  </style>
  