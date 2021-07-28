<template>
  <div class="bg-backdrop">
    <div class="container lobby">
      <div class="row">
        <div class="col-10 offset-1 mb-5">
          <h1>Texas Hold 'Em</h1>
        </div>
        <div class="col-1">
          <i
            class="fa fa-times fa-2x text-red button-type"
            aria-hidden="true"
            @click="close()"
          ></i>
        </div>
      </div>
      <!-- <div class="row mb-5">
        <div class="col-12">
          <span class="bold"> Buy In: </span>
          <select name="buyin" id="buyin" v-model="newTable.BuyIn">
            <option value="100">100</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
            <option value="10000">10000</option>
            <option value="25000">25000</option>
          </select>
          <button
            class="btn btn-info btn-sm ml-3"
            @click="toggleShowCreateTable()"
          >
            Create Table
          </button>
        </div>
      </div> -->
      <div class="row super-center border-bottom">
        <div class="col-2 bold">Table #</div>
        <div class="col-6 border-left border-right bold">Buy-in</div>
        <div class="col-2 border-right bold">Players</div>
        <div class="col-2 bold">Join</div>
      </div>
      <div
        class="row super-center my-1"
        v-for="table in Tables"
        :key="table.id"
        :table="table"
      >
        <div class="col-2">{{ table.Number }}</div>
        <div class="col-6">${{ table.BuyIn }}</div>
        <div class="col-2">{{ table.Players.length }}</div>
        <div class="col-2">
          <button class="btn btn-sm btn-success" @click="joinTable(table.id)">
            Join
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TxLobby",
  data() {
    return {
      newTable: {},
    };
  },
  mounted() {
    this.$store.dispatch("getTXTables");
  },
  computed: {
    Tables() {
      return this.$store.state.tables;
    },
  },
  methods: {
    close() {
      this.$router.push("dashboard");
    },
    createTable() {
      this.$store.dispatch("createTable", newTable);
      this.newTable = {};
    },
    joinTable(id) {
      this.$router.push("texasholdemtable/" + id);
    },
  },
};
</script>
<style scoped>
.mid-divider {
  border-right: 2px solid black;
  border-left: 2px solid black;
}
.lobby {
  position: fixed;
  padding: 2rem;
  top: 10vh;
  bottom: 10vh;
  left: 10vw;
  right: 10vw;
  z-index: 100;
  border-radius: 20px;
  background-color: rgba(171, 180, 187);
  max-height: 80vh;
  max-width: 80vw;
}
.bg-backdrop {
  background-color: black;
  height: 100vh;
}
</style>