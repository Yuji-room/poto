<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card>
            <v-card-title class="headline">ログイン</v-card-title>
            <v-card-text>
              <v-form ref="form" v-model="valid">
                <v-text-field
                  v-model="login.email"
                  label="メールアドレス"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="login.password"
                  label="パスワード"
                  type="password"
                  :rules="[rules.required, rules.minLength]"
                  required
                ></v-text-field>
                <v-btn color="primary" :disabled="!valid" @click="submitLogin">ログイン</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-snackbar v-model="snackbar" color="success">{{ snackbarMessage }}</v-snackbar>
    </v-container>
  </template>
  
  <script>
  import { ref } from "vue";
  import { useAuthStore } from "@/stores/auth"; // PiniaのAuthストアをインポート
  import { useRouter } from "vue-router";
  
  export default {
    setup() {
      const authStore = useAuthStore(); // Pinia ストアを使用
      const router = useRouter();
  
      const valid = ref(false);
      const login = ref({ email: "", password: "" });
      const snackbar = ref(false);
      const snackbarMessage = ref("");
  
      const rules = {
        required: (v) => !!v || "必須項目です",
        email: (v) => /.+@.+\..+/.test(v) || "正しいメールアドレスを入力してください",
        minLength: (v) => v.length >= 6 || "6文字以上入力してください",
      };
  
      const submitLogin = async () => {
        try {
          await authStore.login(login.value);
          snackbarMessage.value = "ログイン成功！";
          snackbar.value = true;
          router.push("/"); // ホームへリダイレクト
        } catch (error) {
          snackbarMessage.value = "ログイン失敗";
          snackbar.value = true;
        }
      };
  
      return {
        valid,
        login,
        snackbar,
        snackbarMessage,
        rules,
        submitLogin,
      };
    },
  };
  </script>
  