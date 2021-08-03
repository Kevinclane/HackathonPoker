<template>
  <div class="d-flex flow-column-reverse" v-if="bet.Player">
    <div>${{ bet.Escrow }}</div>
    <img class="chip-size" src="../assets/Chips/SmallPile.png" alt="" />
  </div>
  <div v-else></div>
</template>

<script>
export default {
  name: "BetDisplay",
  props: ["bet"],
};
</script>