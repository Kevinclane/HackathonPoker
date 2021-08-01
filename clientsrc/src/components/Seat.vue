<template>
  <div v-if="seat.Player" class="text-white row">
    <div class="col-4 text-center">
      <div>{{ seat.Player.Player.name }}</div>
      <img
        class="profile-img"
        :src="`${seat.Player.Player.picture}`"
        alt="error loading image"
      />
      <div>${{ seat.Player.Wallet }}</div>
    </div>
    <div
      v-if="mySeat && hasCards"
      class="col-8 align-items-end justify-content-around d-flex"
    >
      <img
        :src="`../assets/Cards/${seat.Player.Cards[0]}`"
        alt="error loading image"
      />
      <img
        :src="`../assets/Cards/${seat.Player.Cards[1]}`"
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
  </div>
  <div v-else class="seat super-center">
    <div class="super-center button-type" @click="promptJoin()">
      <i class="fa fa-2x fa-plus" aria-hidden="true"></i>
    </div>
  </div>
</template>

<script>
import swal from "sweetalert";
export default {
  name: "Seat",
  props: ["seat", "BuyIn"],
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
      if (this.seat.Player) {
        if (this.seat.Player.Cards.length > 0) {
          return true;
        } else return false;
      } else return false;
    },
    hand() {
      return this.$store.state.hand;
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
</style>