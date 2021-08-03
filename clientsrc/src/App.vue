<template>
  <div id="app">
    <user-g-u-i />
    <router-view />
  </div>
</template>

<script>
import { onAuth } from "@bcwdev/auth0-vue";
import UserGUI from "./components/UserGUI.vue";
export default {
  name: "App",
  async beforeCreate() {
    try {
      await onAuth();
      this.$store.dispatch("setBearer", this.$auth.bearer);
      this.$store.dispatch("getProfile");
    } catch (err) {
      this.$router.push({ name: "home" });
    }
  },
  components: { UserGUI },
};
</script>


<style lang="scss">
@import "./assets/_variables.scss";
@import "bootstrap";
@import "./assets/_overrides.scss";

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.button-type {
  cursor: pointer;
}
.super-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.text-red {
  color: red;
}
.bold {
  font-weight: bold;
}
.card-board {
  height: 10.5vh;
  width: 7.5vh;
  margin-left: 1vw;
  margin-right: 1vw;
}
.flow-column {
  flex-flow: column;
}
.flow-column-reverse {
  flex-flow: column-reverse;
}
.chip-size {
  height: 3vh;
  width: 3vh;
}
</style>
