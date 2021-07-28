<template>
  <div class="table button-type" @click="toTxLobby"></div>
</template>

<script>
export default {
  name: "TxTableTile",
  data() {
    return {
      showModal: false,
    };
  },
  methods: {
    toTxLobby() {
      this.$router.push("txlobby");
    },
  },
  components: {},
};
</script>

<style scoped>
.table {
  background-color: green;
  border: 6px solid rgb(75, 39, 6);
  /* box-shadow: inset 0px 0px 10px 5px black; */
  border-radius: 250px;
  margin-top: 1vh;
  margin-left: 1vh;
  height: 8vh;
  width: 8vw;
  /* margin-top: 25vh; */
}
.black-back {
  background-color: rgba(0, 0, 0, 0.6);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
}
</style>