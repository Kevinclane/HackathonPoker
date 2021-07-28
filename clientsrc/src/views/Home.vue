<template>
  <div class="home container">
    <h1>Welcome</h1>
    <button class="btn btn-danger" v-if="$auth.isAuthenticated" @click="logout">
      Logout
    </button>
    <button class="btn btn-success" v-else @click="login">Login</button>
    <button
      class="btn btn-info"
      v-if="$auth.isAuthenticated"
      @click="toDashboard"
    >
      To Dashboard
    </button>
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
</style>