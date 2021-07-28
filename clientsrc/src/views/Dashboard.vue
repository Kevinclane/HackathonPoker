<template>
  <div class="container-fluid floor wrapper-main border-main h-100">
    <!-- <div class="row">
      <div class="col-12">
        <div class="row h-20">
          <div class="col-12 my-3">Welcome {{ profile.name }}!</div>
          <div class="col-9"></div>
          <div class="col-3 border-red">Profile Info</div>
        </div>
      </div>
    </div> -->
    <div class="row h-100 w-100vw">
      <tile v-for="tile in Tiles" :key="tile.number" :tile="tile" />
    </div>
  </div>
</template>

<script>
import Tile from "../components/flooring/Tile.vue";
export default {
  name: "Dashboard",
  data() {
    return {
      Tiles: [],
      RedTiles: [
        6, 16, 26, 36, 46, 56, 66, 76, 86, 41, 42, 43, 44, 45, 46, 47, 48, 49,
        50, 5, 15, 25, 35, 55, 65, 75, 85,
      ],
      TxTables: [51, 52, 53, 54],
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
      while (i < 90) {
        let tile = {
          number: i + 1,
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
/* .border-main {
  border-top: 5vh solid white;
  border-bottom: 5vh solid white;
  border-left: 5vw solid white;
  border-right: 5vw solid white;
} */
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
.w-100vw {
  width: 100vw;
}
.grid {
  /* height: ; */
}
</style>