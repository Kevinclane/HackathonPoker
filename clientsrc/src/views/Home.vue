<template>
  <div class="home container">
    <h1>Welcome</h1>
    <button class="btn btn-danger" v-if="$auth.isAuthenticated" @click="logout">
      Logout
    </button>
    <button class="btn btn-success" v-else @click="login">Login</button>
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
      await this.$store.dispatch("setBearer", this.$auth.bearer);
      this.$router.push("dashboard");
    },
    async logout() {
      await this.$auth.logout({ returnTo: window.location.origin });
    },
  },
  components: {},
};
</script>


<style scoped>
</style>