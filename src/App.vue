<template>
  <div class="back">
    <v-app class="fill-height" style="background: transparent">
      <NavigationList />
      <router-view class="mt-14" />
    </v-app>
  </div>
</template>


<script>
import NavigationList from "./components/NavigationList.vue";

export default {
  components: {
    NavigationList
  },
  name: "App"
};
</script>

<style>
.back {
  min-height: 100vh;
  margin: 0;
  background: linear-gradient(135deg, #2196F3, #2196F3);
  
}
</style>
