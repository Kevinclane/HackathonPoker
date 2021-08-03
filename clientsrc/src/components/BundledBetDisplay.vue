<template>
  <div class="d-flex flow-column-reverse">
    <div>${{ bet.Escrow }}</div>
    <img class="chip-size" src="../assets/Chips/SmallPile.png" alt="" />
  </div>
</template>

<script>
export default {
  name: "BundledBetDisplay",
  props: ["bet"],
};
</script>

<style scoped>
</style>