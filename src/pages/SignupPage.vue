<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card>
            <v-card-title class="headline">新規登録</v-card-title>
            <v-card-text>
              <v-form ref="form" v-model="valid">
                <v-text-field
                  v-model="user.name"
                  label="ユーザー名"
                  :rules="[rules.required]"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="user.email"
                  label="メールアドレス"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  :error-messages="loginerror"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="user.password"
                  label="パスワード"
                  type="password"
                  :rules="[rules.required, rules.minLength]"
                  required
                ></v-text-field>
                <v-btn color="primary" :disabled="!valid" @click="register">登録</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-snackbar v-model="snackbar" color="success">
        {{ snackbarMessage }}
      </v-snackbar>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        valid: false,
        user: { name: "", email: "", password: "" },
        snackbar: false,
        snackbarMessage: "",
        loginerror:"",
        rules: {
          required: (v) => !!v || "必須項目です",
          email: (v) => /.+@.+\..+/.test(v) || "正しいメールアドレスを入力してください",
          minLength: (v) => v.length >= 6 || "6文字以上入力してください",
        },
      };
    },
    methods: {
      register() {
        axios
          .post("/api/register", this.user)
          .then(() => {
            this.snackbarMessage = "登録が完了しました！";
            this.snackbar = true;
            this.user = { name: "", email: "", password: "" };
            this.$router.push("/login"); 
          })
          .catch((error) => {
            this.loginerror=error.response.data.error;
          });
      },
    },
  };
  </script>
  