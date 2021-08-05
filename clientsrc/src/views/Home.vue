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
      <div class="about-row row super-center my-3">
        <div class="col-10 offset-1">
          <h4 class="my-3">
            Thanks for taking some time to check out my project! My name is
            Kevin Lane and I'm a fullstack developer. I was tasked with building
            a card game for a hackathon and this is what I came up with. I built
            it with a Vue front-end and Node.js + Express back-end with MongoDB
            for the database.
          </h4>
          <h4 class="my-3">
            This is the first time I've really used Socket.io. It was essential
            in order to create a multi-player game. I also had to create an
            event loop to handle the game's functionality (also a first for me).
            That was the most challenging and rewarding part of this entire
            build. I made a diagram of this process so I could better keep track
            of what's going on and be able to find/fix bugs + decide where
            upgrades can be made. I saved a copy of this diagram in the root
            file of this folder. A link to the repo is in the top right corner
            of the screen.
          </h4>
          <h4>
            I'm currently doing freelance work, but am actively seeking a
            full-time position. Feel free to reach out to me via LinkedIn (link
            also in the top right corner).
          </h4>
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
  background-color: rgb(176 196 222 / 0.9);
  border-radius: 20px;
}

.about-row {
  width: 80vw;
  height: 50vh;
  background-color: rgb(176 196 222 / 0.9);
  border-radius: 20px;
}
</style>