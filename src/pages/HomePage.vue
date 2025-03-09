<template>
  <v-container>
    <v-card class="pa-6 mb-4 primary-card">
      <v-card-title class="text-h5 font-weight-bold text-white">エントリー一覧</v-card-title>
    </v-card>
    <v-row>
      <v-col v-for="entry in entries" :key="entry.id" cols="12" md="6" lg="4">
        <v-card class="pa-4 entry-card">
          <v-card-title class="font-weight-bold text-primary">
            {{ entry.companyName }}
          </v-card-title>
          <v-card-subtitle class="font-weight-bold">
            応募日:
            <span class="highlight">
              {{ entry.entryDate ? new Date(entry.entryDate).toLocaleDateString() : '未設定' }}
            </span>
          </v-card-subtitle>
          <v-card-text>
            <h3>業界: <span class="highlight">{{ entry.industry }}</span></h3>
            <h3>ステータス:<span class="highlight">{{ entry.status }}</span></h3>
            <h3 v-if="entry.notes">備考:{{ entry.notes }}</h3>
            <h3>
              <strong>登録日時:</strong>
              <span class="highlight">
                {{ entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '' }}
              </span>
            </h3>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="openEditDialog(entry)">編集</v-btn>
            <v-btn color="red darken-1" @click="openDeleteDialog(entry)">削除</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 編集用ダイアログ -->
    <DialogComponent 
      v-model="editDialog" 
      title="エントリー編集" 
      max-width="600px"
      :actions="[]"
    >
      <!-- 編集時は ProjectsPage に初期データと mode="edit" を渡す -->
      <ProjectsPage 
        :initialEntry="selectedEntry" 
        mode="edit" 
        @submitted="handleEditSubmitted" 
      />
    </DialogComponent>

    <!-- 削除確認用ダイアログ -->
    <DialogComponent 
      v-model="deleteDialog" 
      title="エントリー削除確認" 
      max-width="400px"
      :actions="[
          { text: '削除', color: 'red darken-1', handler: deleteEntry },
          { text: 'キャンセル', handler: () => deleteDialog = false }
        ]"
    >
      <p>本当にこのエントリーを削除してもよろしいですか？</p>
    </DialogComponent>
  </v-container>
</template>

<script>
import axios from 'axios';
import DialogComponent from '@/components/DialogComponent.vue';
import ProjectsPage from './ProjectsPage.vue';
export default {
  components: {
    DialogComponent,
    ProjectsPage
  },
  data: () => ({
    entries: [],
    editDialog: false,
    deleteDialog: false,
    selectedEntry: {}
  }),
  mounted() {
    this.fetchEntries();
  },
  methods: {
    async fetchEntries() {
      try {
        const { data } = await axios.get('/api/entries');
        this.entries = data;
      } catch (err) {
        console.error("エントリー一覧の取得に失敗しました:", err);
        alert("エントリー一覧の取得に失敗しました。");
      }
    },
    openEditDialog(entry) {
      // 編集用にディープコピーを作成して ProjectsPage に渡す
      this.selectedEntry = JSON.parse(JSON.stringify(entry));
      this.editDialog = true;
    },
    handleEditSubmitted(updatedEntry) {
      // 編集結果で一覧を更新
      const index = this.entries.findIndex(e => e.id === updatedEntry.id);
      if (index !== -1) {
        this.entries.splice(index, 1, updatedEntry);
      }
      this.editDialog = false;
      alert("エントリーが更新されました");
    },
    openDeleteDialog(entry) {
      this.selectedEntry = entry;
      this.deleteDialog = true;
    },
    async deleteEntry() {
      try {
        await axios.delete(`/api/entries/${this.selectedEntry.id}`);
        this.entries = this.entries.filter(e => e.id !== this.selectedEntry.id);
        this.deleteDialog = false;
        alert("エントリーが削除されました");
      } catch (error) {
        console.error("エントリー削除に失敗しました:", error);
        alert("エントリーの削除に失敗しました");
      }
    }
  }
};
</script>

<style scoped>
.primary-card {
  background-color: #1976D2;
  border-radius: 10px;
}

.entry-card {
  border-left: 5px solid #1976D2;
  transition: transform 0.2s ease-in-out;
}

.entry-card:hover {
  transform: scale(1.02);
}


</style>