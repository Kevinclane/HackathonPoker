<template>
  <div class="box">
    <tx-table-tile v-if="tile.type == 'txTable'"> </tx-table-tile>
    <carpet v-if="tile.type == 'carpet'"></carpet>
    <!-- {{ tile.number }} -->
  </div>
</template>

<script>
import TxTableTile from "./TxTableTile.vue";
import Carpet from "./Carpet.vue";
export default {
  name: "Tile",
  props: ["tile"],
  data() {
    return {};
  },
  mounted() {},
  methods: {},
  computed: {},
  components: {
    TxTableTile,
    Carpet,
  },
};
</script>

<style scoped>
.box {
  /* border: 1px solid red; */
  height: 10vh;
  width: 10vw;
}

.abcenter {
  position: relative;
  top: 40%;
  /* left: 50%; */
}
</style>