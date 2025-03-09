<template>
  <v-container class="max-w-lg mx-auto">
    <v-card class="pa-6">
      <v-card-title class="text-h5 font-weight-bold">
        {{ mode === 'edit' ? 'エントリー編集' : 'エントリー管理' }}
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submitEntry">
          <v-text-field 
            v-model="entry.companyName" 
            label="会社名" 
            outlined 
            required
          ></v-text-field>

          <v-date-input
            v-model="entry.entryDate"
            label="応募日"
            clearable
            variant="outlined"
          ></v-date-input>

          <v-select 
            v-model="entry.industry" 
            label="業界" 
            :items="industries" 
            outlined
          ></v-select>

          <v-select 
            v-model="entry.status" 
            label="応募ステータス" 
            :items="statuses" 
            outlined
          ></v-select>

          <v-textarea 
            v-model="entry.notes" 
            label="備考" 
            outlined
          ></v-textarea>

          <v-btn type="submit" color="primary" block class="mt-4">
            {{ mode === 'edit' ? '更新' : '送信' }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { VDateInput } from "vuetify/labs/VDateInput";
import axios from "axios";
export default {
  components: {
    VDateInput
  },
  props: {
    initialEntry: {
      type: Object,
      default: () => ({
        companyName: "",
        entryDate: null,
        industry: "",
        status: "検討中",
        notes: ""
      })
    },
    mode: {
      type: String,
      default: "create"  // "create" または "edit"
    }
  },
  data() {
    return {
      entry: { ...this.initialEntry },
      statuses: ["検討中", "応募済み", "面接待ち", "内定", "不採用"],
      industries:[
        "IT・ソフトウェア", "メーカー", "商社", "金融", "コンサルティング",
        "建設", "医療・福祉", "教育", "公務員", "小売・流通", "エンターテインメント"
      ],
    };
  },
  watch: {
    // 親から渡された初期値が更新されたら内部データも更新
    initialEntry(newVal) {
      this.entry = { ...newVal };
    }
  },
  methods: {
    async submitEntry() {
      if (this.mode === "create") {
        try {
          await axios.post('/api/entries', this.entry);
          this.$emit('submitted', this.entry);
          // 送信後、フォームをリセット
          this.entry = {
            companyName: "",
            industry: "",  // 業界もリセット
            entryDate: null,
            status: "検討中",
            notes: ""
          };
          this.$router.push("/");
        } catch (error) {
          console.error("エントリー情報送信失敗:", error);
          alert("エントリー情報送信に失敗しました。");
        }
      } else if (this.mode === "edit") {
        try {
          await axios.put(`/api/entries/${this.entry.id}`, this.entry);
          this.$emit('submitted', this.entry);
        } catch (error) {
          console.error("エントリー更新失敗:", error);
          alert("エントリー情報更新に失敗しました。");
        }
      }
    }
  }
};
</script>
