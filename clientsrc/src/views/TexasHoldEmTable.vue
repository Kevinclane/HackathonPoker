<template>
  <div class="container-fluid wrapper-main floor">
    <div class="row seating-area d-flex justify-content-around">
      <div class="col-2 super-center mb-3">
        <div class="seat super-center">1</div>
      </div>
      <div class="col-2 super-center mb-3">
        <div class="seat super-center">2</div>
      </div>
      <div class="col-2 super-center mb-3">
        <div class="seat super-center">3</div>
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
      <div class="col-2 super-center mt-3">
        <div class="seat super-center">4</div>
      </div>
      <div class="col-2 super-center mt-3">
        <div class="seat super-center">5</div>
      </div>
      <div class="col-2 super-center mt-3">
        <div class="seat super-center">6</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TexasHoldEmTable",
  data() {
    return {
      communityCards: [],
    };
  },
};
</script>

<style scoped>
.wrapper-main {
  height: 100vh;
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
  border: 2px solid red;
  border-radius: 50%;
  height: 10vh;
  width: 10vh;
}
.seating-area {
  padding-top: 4vh;
  padding-bottom: 4vh;
  border: 4px solid cyan;
}
.super-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.card-board {
  height: 10.5vh;
  width: 7.5vh;
  margin-left: 2vw;
  margin-right: 2vw;
}
.dotted-border {
  border: 2px dotted white;
}
.card-hand-1 {
}
.card-hand-2 {
}
</style>