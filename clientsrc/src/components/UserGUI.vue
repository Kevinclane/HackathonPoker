<template>
  <div class="container-fluid sticky-top user-gui">
    <div class="row d-flex align-items-center h-100">
      <div class="col-1">{{ profile.name }}</div>
      <div class="col-3">$ {{ profile.credits }}</div>
      <!-- <div class="col-8">
        <button class="btn btn-info">Change Card Backs</button>
      </div> -->
      <div class="col-8 text-right">
        <a href="https://github.com/Kevinclane" target="_blank">
          <i class="fa fa-github mx-1" aria-hidden="true"></i>
        </a>
        <a href="https://kevinclane.com/" target="_blank">
          <i class="fa fa-address-card mx-1" aria-hidden="true"></i>
        </a>
        <a
          href="https://www.linkedin.com/in/kevinchristopherlane/"
          target="_blank"
        >
          <i class="fa fa-linkedin-square mx-1"></i>
        </a>
      </div>
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
