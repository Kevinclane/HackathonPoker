<template>
  <div class="container-fluid sticky-top user-gui">
    <div class="row d-flex align-items-center h-100">
      <div v-if="!showEditName" class="col-3">
        {{ profile.name }}
        <i class="button-type fa fa-edit" @click="toggleShowEditName()"></i>
      </div>
      <div
        v-else
        class="col-3 d-flex justify-content-between align-items-center"
      >
        <input type="text" v-model="profile.name" />
        <i class="button-type fa fa-check" @click="changeName()"></i>
        <i class="button-type fa fa-close" @click="toggleShowEditName()"></i>
      </div>
      <div class="col-1">$ {{ profile.credits }}</div>
      <div class="col-4">
        <button class="btn btn-info" @click="toggleShowCardBacks()">
          Change Card Backs
        </button>
      </div>
      <div class="col-4 text-right">
        <a href="https://github.com/Kevinclane/HackathonPoker" target="_blank">
          <i class="button-type fa fa-github mx-1" aria-hidden="true"></i>
        </a>
        <a href="https://kevinclane.com/" target="_blank">
          <i class="button-type fa fa-address-card mx-1" aria-hidden="true"></i>
        </a>
        <a
          href="https://www.linkedin.com/in/kevinchristopherlane/"
          target="_blank"
        >
          <i class="button-type fa fa-linkedin-square mx-1"></i>
        </a>
      </div>
    </div>
    <div v-if="showCardBacks" class="overlay row super-center">
      <div
        class="col-4 h-fit"
        v-for="(card, index) in cardBacks"
        :key="`card-${index}`"
      >
        <img
          :class="{ currentCard: cardBack == card }"
          class="card-select button-type"
          :src="require('../assets/Backs/' + card)"
          alt="error loading image"
          @click="chooseCardBack(card)"
        />
        <div class="height-holder text-white">
          <div v-if="card == cardBack">Current</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserGUI",
  data() {
    return {
      showCardBacks: false,
      showEditName: false,
      cardBacks: [
        "blue_back.png",
        "red_back.png",
        "gray_back.png",
        "green_back.png",
        "purple_back.png",
        "yellow_back.png",
      ],
    };
  },
  methods: {
    toggleShowCardBacks() {
      this.showCardBacks = !this.showCardBacks;
    },
    toggleShowEditName() {
      this.showEditName = !this.showEditName;
    },
    changeName() {
      this.$store.dispatch("changeName", this.profile);
      this.toggleShowEditName();
    },
    chooseCardBack(card) {
      let obj = {
        card: card,
      };
      this.$store.dispatch("changeCardBack", obj);
      this.toggleShowCardBacks();
    },
  },
  computed: {
    profile() {
      return this.$store.state.user;
    },
    cardBack() {
      return this.$store.state.user.cardBack;
    },
  },
};
</script>

<style>
.user-gui {
  height: 5vh;
  background-color: lightsteelblue;
}
.overlay {
  position: absolute;
  top: 10vh;
  left: 10vw;
  right: 10vw;
  bottom: 10vh;
  background-color: dimgray;
  z-index: 10;
  height: 80vh;
  width: 80vw;
  border-radius: 20px;
}
.card-select {
  height: 21vh;
  width: 15vh;
}
.h-fit {
  height: fit-content;
}
.currentCard {
  border: 10px solid gold;
  border-radius: 20px;
}
.height-holder {
  height: 2rem;
}
</style>
