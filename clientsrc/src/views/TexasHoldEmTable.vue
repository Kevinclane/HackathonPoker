<template>
  <div class="container-fluid wrapper-main floor">
    <div class="row seating-area d-flex justify-content-around">
      <div class="col-3 mb-3">
        <seat class="" :seat="table.Seats[0]" :BuyIn="table.BuyIn" />
      </div>
      <div class="col-3 mb-3">
        <seat class="" :seat="table.Seats[1]" :BuyIn="table.BuyIn" />
      </div>
      <div class="col-3 mb-3">
        <seat class="" :seat="table.Seats[2]" :BuyIn="table.BuyIn" />
      </div>
      <div class="col-12">
        <div class="row">
          <div class="col-10 offset-1 table super-center">
            <div class="row">
              <div class="col-12 d-flex">
                <div class="card-board dotted-border">
                  <img v-if="communityCards[0]" src="" alt="" />
                </div>
                <div class="card-board dotted-border">
                  <img v-if="communityCards[1]" src="" alt="" />
                </div>
                <div class="card-board dotted-border">
                  <img v-if="communityCards[2]" src="" alt="" />
                </div>
                <div class="card-board dotted-border">
                  <img v-if="communityCards[3]" src="" alt="" />
                </div>
                <div class="card-board dotted-border">
                  <img v-if="communityCards[4]" src="" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-3 mt-3">
        <seat class="" :seat="table.Seats[3]" :BuyIn="table.BuyIn" />
      </div>
      <div class="col-3 mt-3">
        <seat class="" :seat="table.Seats[4]" :BuyIn="table.BuyIn" />
      </div>
      <div class="col-3 mt-3">
        <seat class="" :seat="table.Seats[5]" :BuyIn="table.BuyIn" />
      </div>
    </div>
  </div>
</template>

<script>
import Seat from "../components/Seat.vue";
export default {
  name: "TexasHoldEmTable",
  data() {
    return {
      communityCards: [],
    };
  },
  async mounted() {
    await this.$store.dispatch("initializeSocket");
    await this.$store.dispatch("joinRoom", this.$route.params.tableId);
  },
  beforedestroy() {
    this.$store.dispatch("leaveRoom", this.$route.params.tableId);
  },
  computed: {
    table() {
      return this.$store.state.activeTable;
    },
  },
  methods: {},
  components: {
    Seat,
  },
};
</script>

<style scoped>
.wrapper-main {
  height: 95vh;
  background-color: whitesmoke;
}
.floor {
  background-image: url("../assets/Floor.jpg");
  background-size: 15vh;
}
.table {
  background-color: green;
  border: 30px solid rgb(75, 39, 6);
  box-shadow: inset 0px 0px 10px 5px black;
  border-radius: 250px;
  height: 50vh;
  /* margin-top: 25vh; */
}
.seat {
  /* border: 2px solid red; */
  border: 2px dotted white;
  border-radius: 50%;
  height: 10vh;
  width: 10vh;
}
.seating-area {
  padding-top: 4vh;
  padding-bottom: 4vh;
  /* border: 4px solid cyan; */
}

.card-board {
  height: 10.5vh;
  width: 7.5vh;
  margin-left: 1vw;
  margin-right: 1vw;
}
.dotted-border {
  border: 2px dotted white;
}
.card-hand-1 {
}
.card-hand-2 {
}
</style>