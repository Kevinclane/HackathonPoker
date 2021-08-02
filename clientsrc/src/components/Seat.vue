<template>
  <div v-if="seat.Player" class="text-white row">
    <!-- REGION HEAD -->

    <div class="col-12">
      <div v-if="mySeat && myTurn" class="d-flex">
        <div>
          <button class="btn btn-sm btn-success" @click="userChoice('Raise')">
            Raise
          </button>
          <input class="w-sm ml-2" type="number" min="0" v-model="betAmount" />
        </div>
        <button
          class="btn btn-sm btn-info mx-2 h-50"
          @click="userChoice('Call/Pass')"
        >
          Call/Pass
        </button>
        <button class="btn btn-sm btn-danger h-50" @click="userChoice('Fold')">
          Fold
        </button>
      </div>
      <div v-else>{{ seat.Player.Player.name }}</div>
    </div>

    <!-- END REGION HEAD -->

    <!-- REGION PICTURE -->

    <div class="col-4 text-center">
      <div :class="{ goldBorder: myTurn }">
        <img
          class="profile-img"
          :src="`${seat.Player.Player.picture}`"
          alt="error loading image"
        />
      </div>
      <div>${{ seat.Player.Wallet }}</div>
    </div>

    <!-- END REGION PICTURE -->

    <!-- REGION CARDS -->

    <div
      v-if="mySeat && hasCards"
      class="col-8 align-items-end justify-content-around d-flex"
    >
      <img
        class="card-board"
        :src="require('../assets/Cards/' + seat.Player.Cards[0].Img)"
        alt="error loading image"
      />
      <img
        class="card-board"
        :src="require('../assets/Cards/' + seat.Player.Cards[1].Img)"
        alt="error loading image"
      />
    </div>
    <div v-else class="col-8 align-items-end justify-content-around d-flex">
      <div v-if="hasCards">
        <img
          class="card-hand"
          src="../assets/Backs/red_back.png"
          alt="error loading image"
        />
      </div>
      <div v-if="hasCards">
        <img
          class="card-hand"
          src="../assets/Backs/red_back.png"
          alt="error loading image"
        />
      </div>
    </div>

    <!-- END REGION CARDS -->

    <!-- REGION JOIN BUTTON -->
  </div>
  <div v-else class="seat super-center">
    <div class="super-center button-type" @click="promptJoin()">
      <i class="fa fa-2x fa-plus" aria-hidden="true"></i>
    </div>

    <!-- END REGION JOIN BUTTON -->
  </div>
</template>

<script>
import swal from "sweetalert";
export default {
  name: "Seat",
  props: ["seat", "BuyIn"],
  data() {
    return {
      betAmount: 0,
    };
  },
  computed: {
    mySeat() {
      if (this.seat.Player) {
        if (this.seat.Player.Player._id == this.$store.state.user._id) {
          return true;
        } else return false;
      } else {
        return false;
      }
    },
    hasCards() {
      if (this.$store.state.activeTable.PlayersTurn) {
        return true;
      } else return false;
    },
    myTurn() {
      if (this.seat.Status == "Turn") {
        return true;
      } else return false;
    },
    groupNumber() {
      return 1;
    },
  },
  methods: {
    promptJoin() {
      swal({
        title: `The buyin for this table is $${this.BuyIn}`,
        text: "Would you like to join?",
        icon: "info",
        buttons: ["No thanks", "Yes please!"],
      }).then((confirm) => {
        if (confirm) {
          let reqObj = {
            tableId: this.$route.params.tableId,
            position: this.seat.Position,
            buyIn: this.BuyIn,
          };
          this.$store.dispatch("sit", reqObj);
        }
      });
    },
    userChoice(type) {
      //add checker to betAmount to make sure it's not smaller than current bet
      let choice = {
        type: type,
        amount: this.betAmount,
        tableId: this.$store.state.activeTable._id,
        groupNumber: this.groupNumber,
        playerId: this.$store.state.user._id,
      };
      this.$store.dispatch("submitUserChoice", choice);
    },
  },
};
</script>

<style scoped>
.profile-img {
  border-radius: 50%;
  height: 8vh;
  width: 8vh;
  margin-top: 1vh;
  margin-bottom: 1vh;
}
.card-hand {
  height: 10.5vh;
  width: 7.5vh;
}
.w-sm {
  width: 4rem;
}
.goldBorder {
  height: 8.5vh;
  width: 8.5vh;
  border-radius: 50%;
  box-shadow: gold;
  background-color: gold;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* .goldBorder {
  position: absolute;
  display: block;
  top: -50%;
  left: -50%;
  z-index: -9;
  display: block;
  height: 200%;
  width: 200%;
  transform: rotate(-45deg);
  overflow: hidden;
  background: linear-gradient(
    to right,
    #fff 20%,
    #fff 40%,
    #ecd08c 50%,
    #ecd08c 55%,
    #fff 70%,
    #fff 100%
  );
  background-size: 200% auto;

  animation: shine 3s linear infinite;
} */
</style>