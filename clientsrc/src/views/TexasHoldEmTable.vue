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

      <!-- REGION TABLE -->

      <div class="col-12">
        <div class="row">
          <div class="col-10 offset-1 table super-center flow-column">
            <div class="row bet-row w-100">
              <div class="col-12 d-flex justify-content-around">
                <bet-display :bet="table.Seats[0].Bet" />
                <bet-display :bet="table.Seats[1].Bet" />
                <bet-display :bet="table.Seats[2].Bet" />
              </div>
            </div>
            <div class="row bet-row w-100">
              <div class="col-8 offset-2 d-flex justify-content-around">
                <bundled-bet-display
                  v-for="bet in table.Bets"
                  :key="bet.id"
                  :bet="bet"
                />
              </div>
            </div>

            <!-- REGION COMMUNITY CARDS -->

            <div class="row">
              <div class="col-12 d-flex">
                <img
                  class="card-board"
                  v-if="table.CommunityCards[0]"
                  :src="
                    require('../assets/Cards/' + table.CommunityCards[0].Img)
                  "
                  alt="error loading image"
                />
                <div v-else class="card-board dotted-border"></div>
                <img
                  class="card-board"
                  v-if="table.CommunityCards[1]"
                  :src="
                    require('../assets/Cards/' + table.CommunityCards[1].Img)
                  "
                  alt="error loading image"
                />
                <div v-else class="card-board dotted-border"></div>
                <img
                  class="card-board"
                  v-if="table.CommunityCards[2]"
                  :src="
                    require('../assets/Cards/' + table.CommunityCards[2].Img)
                  "
                  alt="error loading image"
                />
                <div v-else class="card-board dotted-border"></div>
                <img
                  class="card-board"
                  v-if="table.CommunityCards[3]"
                  :src="
                    require('../assets/Cards/' + table.CommunityCards[3].Img)
                  "
                  alt="error loading image"
                />
                <div v-else class="card-board dotted-border"></div>
                <img
                  class="card-board"
                  v-if="table.CommunityCards[4]"
                  :src="
                    require('../assets/Cards/' + table.CommunityCards[4].Img)
                  "
                  alt="error loading image"
                />
                <div v-else class="card-board dotted-border"></div>
              </div>
            </div>

            <!-- END REGION COMMUNITY CARDS -->

            <div class="row bet-row w-100">
              <div class="col-12">
                <div v-if="winners.length > 0">Next game starting soon...</div>
                <div class="col-12">
                  <button class="btn btn-warning" @click="promptGameBroken()">
                    Game Broken
                  </button>
                </div>
              </div>
            </div>
            <div class="row bet-row w-100">
              <div class="col-12 d-flex justify-content-around">
                <bet-display :bet="table.Seats[3].Bet" />
                <bet-display :bet="table.Seats[4].Bet" />
                <bet-display :bet="table.Seats[5].Bet" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- END REGION -->

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
import BundledBetDisplay from "../components/BundledBetDisplay.vue";
import BetDisplay from "../components/BetDisplay.vue";
import Seat from "../components/Seat.vue";
export default {
  name: "TexasHoldEmTable",
  data() {
    return {};
  },
  async mounted() {
    await this.$store.dispatch("initializeSocket");
    await this.$store.dispatch("joinRoom", this.$route.params.tableId);
  },
  async beforeDestroy() {
    await this.$store.dispatch("leaveRoom", {
      tableId: this.table._id,
      userId: this.$store.state.user._id,
    });
  },
  computed: {
    table() {
      return this.$store.state.activeTable;
    },
    winners() {
      return this.$store.state.activeTable.Winner;
    },
  },
  methods: {
    promptGameBroken() {
      swal({
        title: `This game may encounter some unexpected bugs. Confirming will reset the games. The process should only take a minute or two at most.`,
        text: "Continue?",
        icon: "info",
        buttons: ["Nevermind", "Reset"],
      }).then((confirm) => {
        if (confirm) {
          this.$store.dispatch("hardReset", this.$route.params.tableId);
          this.$router.push({ name: "dashboard" });
        }
      });
    },
  },
  components: {
    Seat,
    BetDisplay,
    BundledBetDisplay,
  },
};
</script>

<style scoped>
.wrapper-main {
  height: 95vh;
  background-color: whitesmoke;
  overflow-y: hidden;
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

.dotted-border {
  border: 2px dotted white;
}

.bet-row {
  height: 5vh;
  margin-top: 2.5vh;
  margin-bottom: 2.5vh;
}
</style>