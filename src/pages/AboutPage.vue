<template>
  <v-card>
    <v-card-title class="text-h5 font-weight-bold">ステータス分析</v-card-title>
    <v-card-text>
      <canvas ref="chartCanvas"></canvas>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'StatusChart',
  data() {
    return {
      chart: null
    };
  },
  mounted() {
    axios.get('/api/entries/status')
      .then(response => {
        // API は各エントリーの { id, status } を返すので、
        // それらを集計して各ステータスの件数を算出する
        const rows = response.data;
        const statusCounts = rows.reduce((acc, row) => {
          acc[row.status] = (acc[row.status] || 0) + 1;
          return acc;
        }, {});
        
        // 表示用のステータス一覧（順番は必要に応じて調整）
        const statuses = ["検討中", "応募済み", "面接待ち", "内定", "不採用"];
        const labels = statuses;
        const counts = statuses.map(status => statusCounts[status] || 0);
        
        this.createChart(labels, counts);
      })
      .catch(error => {
        console.error("ステータスデータの取得に失敗しました:", error);
      });
  },
  methods: {
    createChart(labels, counts) {
      const ctx = this.$refs.chartCanvas.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'bar', // 棒グラフを使用（必要に応じて pie 等に変更可能）
        data: {
          labels: labels,
          datasets: [{
            label: '件数',
            data: counts,
            backgroundColor: [
              'rgba(75, 192, 192, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(153, 102, 255, 0.2)'
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
canvas {
  max-height: 300px;
}
</style>
