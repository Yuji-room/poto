<template>
    <v-container class="mt-8">
      <v-card v-if="post" class="mx-auto post-card">
        <v-img
            :src="'https://picsum.photos/800/400'"
            height="250px"
            cover
        ></v-img>
  
        <v-card-title class="headline font-weight-bold">
          {{ post.title }}
        </v-card-title>
  
        <v-card-subtitle class="text-grey-darken-1">
          {{ formatDate(post.created_at) }}
        </v-card-subtitle>
  
        <v-card-text class="post-content">
          <p>{{ post.content }}</p>
        </v-card-text>
  
        <v-card-actions class="d-flex justify-space-between">
          <v-btn to="/blog">ブログ一覧に戻る</v-btn>
          <v-btn @click="sharePost">シェア</v-btn>
        </v-card-actions>
      </v-card>
  
      <v-container v-else class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p class="mt-4">記事を読み込み中...</p>
      </v-container>
  
      <!-- コメントセクション -->
      <v-card class="mx-auto mt-6 post-card">
        <v-card-title>コメント</v-card-title>
        <v-card-text>
          <v-textarea v-model="newComment" label="コメントを入力" outlined></v-textarea>
          <v-btn @click="postComment" color="primary" :disabled="!newComment">コメントを投稿</v-btn>
        </v-card-text>
        <v-divider></v-divider>
        <v-list v-if="comments.length">
          <v-list-item v-for="comment in comments" :key="comment.id">
            <v-list-item-content>
              <v-list-item-title>{{ comment.author }}</v-list-item-title>
              <v-list-item-subtitle>{{ formatDate(comment.created_at) }}</v-list-item-subtitle>
              <p>{{ comment.content }}</p>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <p v-else class="text-center mt-4">コメントはまだありません</p>
      </v-card>
    </v-container>
  </template>
  
  <script>
  export default {
    props: ['id'],
    data() {
      return {
        post: null,
        comments: [],
        newComment: ""
      }
    },
    created() {
      this.fetchPost()
      this.fetchComments()
    },
    methods: {
      fetchPost() {
        fetch(`/api/posts/${this.id}`)
          .then(response => response.json())
          .then(data => {
            this.post = data
          })
          .catch(error => {
            console.error('記事の取得に失敗しました:', error)
          })
      },
      fetchComments() {
        fetch(`/api/posts/${this.id}/comments`)
          .then(response => response.json())
          .then(data => {
            this.comments = data
          })
          .catch(error => {
            console.error('コメントの取得に失敗しました:', error)
          })
      },
      postComment() {
        if (!this.newComment) return
        const commentData = { content: this.newComment, author: "匿名", created_at: new Date() }
        
        fetch(`/api/posts/${this.id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commentData)
        })
        .then(response => response.json())
        .then(data => {
          this.comments.push(data)
          this.newComment = ""
        })
        .catch(error => {
          console.error('コメントの投稿に失敗しました:', error)
        })
      },
      formatDate(date) {
        if (!date) return "日付不明";
        const dt = new Date(date);
        dt.setHours(dt.getHours() + 9); // UTC → JSTに変換
        return dt.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
      },
      sharePost() {
        if (navigator.share) {
          navigator.share({
            title: this.post.title,
            url: window.location.href
          }).catch(error => console.error("シェアに失敗:", error))
        } else {
          alert("このブラウザではシェア機能が利用できません")
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .post-card {
    max-width: 800px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
  }
  
  .post-content {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #333;
  }
  
  .v-card-title {
    font-size: 1.8rem;
  }
  
  .v-card-subtitle {
    font-size: 0.9rem;
  }
  </style>
  