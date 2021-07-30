<template>
  <div v-if="seat.Player">
    <img
      class="profile-img"
      :src="`${seat.Player.Player.picture}`"
      alt="error loading image"
    />
  </div>
  <div v-else class="super-center button-type" @click="promptJoin()">
    <i class="fa fa-plus" aria-hidden="true"></i>
  </div>
</template>

<script>
import swal from "sweetalert";
export default {
  name: "Seat",
  props: ["seat", "BuyIn"],
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
}
</style>