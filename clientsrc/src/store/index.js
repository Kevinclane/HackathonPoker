import Vue from 'vue'
import Vuex from 'vuex'
import router from '../router/index'
import { api } from "./AxiosService"
import io from "socket.io-client";

Vue.use(Vuex)

let socket = {};

export default new Vuex.Store({
  state: {
    user: {},
    tables: [],
    activeTable: {}
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setActiveTable(state, table) {
      state.activeTable = table
    },
    setTables(state, tables) {
      state.tables = tables
    }
  },
  actions: {
    setBearer({ }, bearer) {
      api.defaults.headers.authorization = bearer;
    },
    resetBearer() {
      api.defaults.headers.authorization = "";
    },
    async getProfile({ commit }) {
      try {
        let res = await api.get("/profile")
        commit("setUser", res.data)
      } catch (err) {
        console.error(err)
      }
    },
    async createTable({ commit }, table) {
      try {
        let res = await api.post("/texasholdem/createtable")
        commit("setActiveTable", res.data)
        this.$router.push('texasholdemtable/' + res.data.id)
      } catch (error) {
        console.error(error)
      }
    },
    async getTXTables({ commit }) {
      try {
        let res = await api.get("/texasholdem/gettables")
        commit("setTables", res.data)
      } catch (error) {
        console.error(error)
      }
    },
    async test({ }) {
      try {
        // debugger
        socket.emit("dispatch", "a test message")
      } catch (error) {
        console.error(error)
      }
    },

    initializeSocket({ commit, dispatch }) {
      //establish connection with socket
      let baseUrl = location.host.includes("localhost")
        ? "http://localhost:3000/"
        : "/";
      socket = io(baseUrl);
      //Handle any on connection events
      socket.on("CONNECTED", (data) => {
        console.log(data.message)
      });

      socket.on("Test", (data) => {
        // commit("setNewComment", data);
        debugger
        console.log(data)
        // this.dispatch("getComments", comment.jobId);
      });
    },
    test({ }) {
      socket.emit("dispatch", { action: "Test", data: "Test" })
    },
    joinRoom({ commit, dispatch }, roomName) {
      socket.emit("dispatch", { action: "JoinRoom", data: roomName });
    },
    leaveRoom({ commit, dispatch }, roomName) {
      socket.emit("dispatch", { action: "LeaveRoom", data: roomName });
    },
  }
})
