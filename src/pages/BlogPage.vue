<template>
    <v-container class="blog-list" fluid>
      <v-row align="center" justify="space-between">
        <v-col cols="6">
          <h1>ブログ一覧</h1>
        </v-col>
        <v-col cols="6" class="text-right">
          <v-btn color="primary" @click="handleAddClick">
            <v-icon left>mdi-plus</v-icon>
            追加
          </v-btn>
          <v-btn color="red" class="ml-2" @click="handleDeleteClick">
            <v-icon left>mdi-delete</v-icon>
            削除
          </v-btn>
        </v-col>
      </v-row>
  
      <!-- ログイン要求ダイアログ -->
    <DialogComponent 
      v-model="loginDialog" 
      title="ログインが必要です" 
      max-width="400px"
      :actions="[{ text: 'ログインする', color: 'primary', handler: () => $router.push('/login') }, { text: 'キャンセル', handler: () => loginDialog = false }]"
    >
      <p>この操作を行うには、ログインする必要があります。</p>
    </DialogComponent>
  
      <!-- 記事追加・編集用ダイアログ -->
    <DialogComponent 
      v-model="dialog" 
      :title="editMode ? '記事を編集' : '新しい記事を追加'"
      max-width="600px"
      :actions="[{ text: '保存', color: 'blue darken-1', handler: savePost }, { text: 'キャンセル', color: 'red darken-1', handler: () => dialog = false }]"
    >
      <v-text-field v-model="newPost.title" label="タイトル"></v-text-field>
      <v-textarea v-model="newPost.content" label="内容"></v-textarea>
    </DialogComponent>

    <DialogComponent 
      v-model="deleteDialog" 
      title="削除する記事を選択" 
      max-width="600px"
      :actions="[{ text: '削除', color: 'red darken-1', handler: deleteSelectedPosts }, { text: 'キャンセル', handler: () => deleteDialog = false }]"
    >
      <v-combobox v-model="selectedPostId" :items="posts" item-text="title" item-value="id" label="削除する記事" multiple />
    </DialogComponent>
  
      <!-- 記事一覧 -->
      <v-row>
        <v-col v-for="post in posts" :key="post.id" cols="12" sm="6" md="4">
          <v-card class="ma-3" outlined>
            <v-card-title>
                {{ post.title }}
            </v-card-title>
            <v-card-text>
              <div class="text-truncate">
                {{ post.content }}
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn text small :to="'/blog/' + post.id">詳細を見る</v-btn>
              <v-btn text small color="blue" @click="handleEditClick(post)">編集</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  import { useAuthStore } from "@/stores/auth";
  import { mapState } from "pinia";
  import DialogComponent from "@/components/DialogComponent.vue";
  
  export default {
    name: "BlogList",
    components:{
        DialogComponent,
    },
    data() {
      return {
        dialog: false,
        deleteDialog: false,
        loginDialog: false,
        editMode: false,
        posts: [],
        newPost: { title: "", content: "", id: null },
        selectedPostId: [],
      };
    },
    computed: {
      ...mapState(useAuthStore, ["isLoggedIn", "token"]), // Pinia からログイン状態とトークンを取得
    },
    created() {
      this.fetchPosts();
    },
    methods: {
      fetchPosts() {
        axios
          .get("/api/posts")
          .then((response) => {
            this.posts = response.data;
          })
          .catch((error) => {
            console.error("記事の取得に失敗しました:", error);
          });
      },
  
      handleAddClick() {
        if (this.isLoggedIn) {
          this.openDialog();
        } else {
          this.loginDialog = true;
        }
      },
  
      handleDeleteClick() {
        if (this.isLoggedIn) {
          this.openDeleteDialog();
        } else {
          this.loginDialog = true;
        }
      },
  
      handleEditClick(post) {
        if (this.isLoggedIn) {
          this.openDialog(post);
        } else {
          this.loginDialog = true;
        }
      },
  
      goToLogin() {
        this.loginDialog = false;
        this.$router.push("/login");
      },
  
      openDialog(post = null) {
        this.dialog = true;
        if (post) {
          this.editMode = true;
          this.newPost = { ...post };
        } else {
          this.editMode = false;
          this.newPost = { title: "", content: "", id: null };
        }
      },
  
      closeDialog() {
        this.dialog = false;
      },
  
      openDeleteDialog() {
        this.selectedPostId = [];
        this.deleteDialog = true;
      },
  
      closeDeleteDialog() {
        this.deleteDialog = false;
      },
  
      savePost() {
        const headers = { Authorization: `Bearer ${this.token}` };
  
        if (this.editMode) {
          axios
            .put(`/api/posts/${this.newPost.id}`, this.newPost, { headers })
            .then(() => {
              this.fetchPosts();
              this.closeDialog();
            })
            .catch((error) => {
              console.error("記事の更新に失敗しました:", error);
            });
        } else {
          axios
            .post("/api/posts", this.newPost, { headers })
            .then((response) => {
              this.posts.push(response.data);
              this.closeDialog();
            })
            .catch((error) => {
              console.error("記事の保存に失敗しました:", error);
            });
        }
      },
  
      deleteSelectedPosts() {
        const headers = { Authorization: `Bearer ${this.token}` };
        const idsToDelete = this.selectedPostId.map((post) => post.id);
  
        if (idsToDelete.length > 0) {
          axios
            .delete("/api/posts", { data: { ids: idsToDelete }, headers })
            .then(() => {
              this.posts = this.posts.filter((post) => !idsToDelete.includes(post.id));
              this.closeDeleteDialog();
            })
            .catch((error) => {
              console.error("記事の削除に失敗しました:", error);
            });
        }
      },
    },
  };
  </script>
  