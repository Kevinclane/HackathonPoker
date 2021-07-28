<template>
  <div class="table button-type" @click="openModal"></div>
</template>

<script>
export default {
  name: "TxTableTile",
  methods: {
    openModal() {
      console.log("test");
    },
  },
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
</style>