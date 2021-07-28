<template>
  <div class="container-fluid sticky-top user-gui">
    <div class="row">
      <div class="col-1">{{ profile.name }}</div>
      <div class="col-3">$ Credits</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserGUI",
  methods: {},
  computed: {
    profile() {
      return this.$store.state.user;
    },
  },
};
</script>

<style>
.user-gui {
  height: 5vh;
  background-color: lightsteelblue;
}
</style>
