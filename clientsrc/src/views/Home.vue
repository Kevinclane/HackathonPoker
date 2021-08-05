<template>
  <div class="home bg">
    <h1 class="head-section super-center">Welcome to Kevin's Casino!</h1>
    <div class="games-section">
      <div>
        <h2>Current Games</h2>
      </div>
      <div class="game-row row super-center">
        <div class="col-10">
          <h3>Texas Hold 'Em!</h3>
        </div>
        <div class="col-2">
          <button
            class="btn btn-info"
            v-if="$auth.isAuthenticated"
            @click="toDashboard"
          >
            To The Casino Floor!
          </button>
          <button v-else class="btn btn-info" @click="login">Login</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: "home",
  data() {
    return {};
  },
  computed: {},
  methods: {
    async login() {
      await this.$auth.loginWithRedirect();
      debugger;
      await this.$store.dispatch("setBearer", this.$auth.bearer);
      await this.$store.dispatch("getProfile");
    },
    async logout() {
      await this.$auth.logout({ returnTo: window.location.origin });
    },
    toDashboard() {
      this.$router.push("dashboard");
    },
  },
  components: {},
};
</script>


<style scoped>
.bg {
  background-image: url("../assets/BG.jpg");
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  background-position: center;
  position: fixed;
  font-family: "Gloria Hallelujah", cursive;
  margin: 0 auto;
  overflow-x: hidden;
  user-select: none;
  min-height: 95vh;
  width: 100vw;
}

.head-section {
  height: 20vh;
  color: black;
}

.games-section {
  height: 80vh;
  color: black;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
}
.game-row {
  width: 80vw;
  height: 10vh;
  background-color: rgb(176 196 222 / 0.7);
  border-radius: 20px;
}
</style>