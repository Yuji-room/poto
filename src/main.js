import { createApp } from 'vue'
import { createPinia } from 'pinia';
import piniaPersistedState from "pinia-plugin-persistedstate";
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import './assets/style.css';


const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPersistedState); // Pinia にプラグインを適用

app.use(pinia);
app.use(router)
app.use(vuetify) // Vuetifyをアプリケーションに追加
app.mount('#app')