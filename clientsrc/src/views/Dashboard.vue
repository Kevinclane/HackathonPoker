<template>
  <div class="container-fluid floor wrapper-main border-main h-100">
    <div class="row">
      <div class="col-12">
        <div class="row h-20">
          <div class="col-12 my-3">Welcome {{ profile.name }}!</div>
          <div class="col-9"></div>
          <div class="col-3 border-red">Profile Info</div>
        </div>
      </div>
    </div>
    <div class="row h-70 grid">
      <tile v-for="tile in Tiles" :key="tile.number" :tile="tile" />
    </div>
  </div>
</template>

<script>
import Tile from "../components/Tile.vue";
export default {
  name: "Dashboard",
  data() {
    return {
      Tiles: [],
      RedTiles: [19, 20, 21, 22, 23, 24, 25, 26, 27, 32, 41, 50, 59],
      TxTables: [28, 29, 30, 31],
    };
  },
  async mounted() {
    this.generateTiles();
  },
  computed: {
    profile() {
      return this.$store.state.user;
    },
  },
  methods: {
    getProfile() {
      this.$store.dispatch("getProfile");
    },
    generateTiles() {
      let i = 0;
      while (i < 63) {
        let tile = {
          numer: i + 1,
        };
        tile.type = this.getTileType(i + 1);
        this.Tiles.push(tile);
        i++;
      }
    },
    getTileType(num) {
      let res = "";
      if (this.RedTiles.includes(num)) {
        res = "carpet";
      } else if (this.TxTables.includes(num)) {
        res = "txTable";
      }
      return res;
    },
  },
  components: {
    Tile,
  },
};
</script>

<style scoped>
.border-red {
  border: 2px solid red;
}
.wrapper-main {
  height: 100vh;
}
.border-main {
  border-top: 5vh solid white;
  border-bottom: 5vh solid white;
  border-left: 5vw solid white;
  border-right: 5vw solid white;
}
.floor {
  background-image: url("../assets/Floor.jpg");
  background-size: 0.5vh;
}
.h-20 {
  height: 20vh;
}
.h-70 {
  height: 70vh;
}
.grid {
  /* height: ; */
}
</style>