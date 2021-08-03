<template>
  <div v-if="seat.Player" class="text-white row">
    <!-- REGION HEAD -->

    <div class="col-12 mb-1">
      <div v-if="mySeat && myTurn" class="d-flex justify-content-around">
        <div>
          <button v-if="myBet == 0" class="btn btn-sm btn-success" disabled>
            Raise
          </button>
          <button
            v-else
            class="btn btn-sm btn-success"
            @click="userChoice('Raise')"
          >
            Raise
          </button>
          <input class="w-sm ml-2" type="number" :min="0" v-model="myBet" />
        </div>

        <button
          v-if="seat.Bet.Escrow == highestBet"
          class="btn btn-sm btn-info mx-2 h-50"
          @click="userChoice('Pass')"
        >
          Pass
        </button>
        <button
          v-else
          class="btn btn-sm btn-info mx-2 h-50"
          @click="userChoice('Call')"
        >
          Call ({{ callDifference }})
        </button>

        <button class="btn btn-sm btn-danger h-50" @click="userChoice('Fold')">
          Fold
        </button>
      </div>
      <div v-else>{{ seat.Player.Player.name }}</div>
    </div>

    <!-- END REGION HEAD -->

    <!-- REGION PICTURE -->

    <div class="col-4 text-center mt-1">
      <div class="super-center" :class="{ cwSpin: myTurn }">
        <img
          :class="{ ccwSpin: myTurn }"
          class="profile-img"
          :src="`${seat.Player.Player.picture}`"
          alt="error loading image"
        />
      </div>
      <i
        v-if="mySeat"
        class="fa fa-edit edit-button"
        @click="toggleShowEditPhoto()"
      ></i>
      <input v-if="showEditPhoto" type="file" @change="uploadPhoto" />
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
      prevBetAmount: 0,
      myBet: 0,
      showEditPhoto: false,
    };
  },
  mounted() {
    this.prevBetAmount = this.seat.Bet.Escrow;
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
    highestBet() {
      return this.$store.state.highestBet;
    },
    callDifference() {
      return this.$store.state.highestBet - this.seat.Bet.Escrow;
    },
    winner() {
      if (this.$store.state.winners.includes(this.seat.Player._id)) {
        return true;
      } else return false;
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
      if (type == "Call") {
        this.myBet = this.highestBet - this.seat.Bet.Escrow;
        this.seat.Bet.Escrow = this.highestBet;
      } else if (type == "Raise") {
        this.seat.Bet.Escrow += parseInt(this.myBet) + this.highestBet;
      }
      let choice = {
        type: type,
        newBet: this.myBet,
        Bet: this.seat.Bet,
      };
      this.$store.dispatch("submitUserChoice", choice);
      this.myBet = 0;
    },
    toggleShowEditPhoto() {
      this.showEditPhoto = !this.showEditPhoto;
    },
    async uploadPhoto(event) {
      await this.fileToDataURL(event, this.dispatchPic);
    },
    dispatchPic(img) {
      this.$store.dispatch("uploadProfilePicture", img);
      this.toggleShowEditPhoto();
    },
    fileToDataURL(event, dispatchPic) {
      if (
        event.target.files[0]["type"] === "image/jpeg" ||
        event.target.files[0]["type"] === "image/png"
      ) {
        const reader = new FileReader();
        reader.addEventListener(
          "load",
          function () {
            dispatchPic(reader.result);
          },
          false
        );
        reader.readAsDataURL(event.target.files[0]);
      } else {
        swal({
          text: "Selected file must be .jpeg or .png",
        });
      }
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
.turnBorder {
  height: 8.5vh;
  width: 8.5vh;
  border-radius: 50%;
  box-shadow: green;
  background-color: green;
  display: flex;
  justify-content: center;
  align-items: center;
}
.edit-button {
  position: absolute;
  right: 70%;
  top: 60%;
}

.cwSpin {
  animation-name: spin;
  animation-duration: 5000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  background-image: url("../assets/TurnBorder.png");
  border-radius: 50%;
  height: 9.5vh;
  width: 9.5vh;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.ccwSpin {
  animation-name: invertSpin;
  animation-duration: 5000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

@keyframes invertSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}
</style>