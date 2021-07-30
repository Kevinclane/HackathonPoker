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
    activeTable: {},
    hand: []
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
    },
    setHand(state, cards) {
      state.hand = cards
    },
    setSeats(state, seats) {
      state.activeTable.Seats = seats
    },
    playerLeft(state, _id) {
      state.activeTable
      let i = table.Seats.findIndex(s => s.Player.Player._id == profile._id)
      if (i != -1) {
        table.Seats[i].Player = null
      }
      if (table.PlayersWatching.includes(profile.id)) {
        i = table.PlayersWatching.findIndex(p => p.id == id)
        table.PlayersWatching.splice(i, 1)
      }
      if (table.PlayersAtTable.includes(profile.id)) {
        i = table.PlayersAtTable.findIndex(p => p.id == id)
        table.PlayersAtTable.splice(i, 1)
      }
      state.activeTable = table
    }
  },
  actions: {
    setBearer({ }, bearer) {
      api.defaults.headers.authorization = bearer;
    },
    resetBearer() {
      api.defaults.headers.authorization = "";
    },


    //#region ProfileStuff


    async getProfile({ commit }) {
      try {
        let res = await api.get("/profile")
        commit("setUser", res.data)
      } catch (err) {
        console.error(err)
      }
    },


    //#endregion ProfileStuff

    //#region Potentially reusable functions for games

    async getHand({ commit }, id) {
      try {
        let res = await api.get("/cards/gethand/" + id)
        commit("setHand", res.data.Cards)
      } catch (error) {
        console.error(error)
      }
    },

    //#endregion  End Potential

    //#region TxTables

    async getTXTables({ commit }) {
      try {
        let res = await api.get("/texasholdem/gettables")
        commit("setTables", res.data)
      } catch (error) {
        console.error(error)
      }
    },
    async joinTable({ commit, dispatch }, tableId) {
      try {
        let res = await api.put("/texasholdem/jointable/" + tableId)
        if (res.data.PlayersAtTable.length > 1 && !res.data.Active) {
          socket.emit("texasholdem", {
            action: "startGame", body: {
              tableId: tableId
            }
          })
        }
        commit("setActiveTable", res.data)
      } catch (error) {
        console.error(error)
      }
    },
    async leaveTable({ commit }, tableId) {
      try {
        let res = await api.put("texasholdem/leavetable/" + tableId)
        if (res.data) {
          this.io.emit("texasholdem", {
            action: "playerLeft",
            body: {
              playerId: res.data
            }
          })
        }
      } catch (error) {
        console.error(error)
      }
    },
    async sit({ commit }, reqObj) {
      try {
        let res = await api.put("/texasholdem/sit/" + reqObj.tableId, reqObj)
        socket.emit("texasholdem", {
          action: "getSeats", body: {
            tableId: reqObj.tableId
          }
        })
      } catch (error) {
        console.error(error)
      }
    },
    async getSeats({ commit }, id) {
      try {
        let res = await api.get("/texasholdem/getseats/" + id)
        commit("setSeats", res.data)
      } catch (error) {
        console.error(error)
      }
    },
    //#endregion TxTables



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


      //May want to have this share the turn timer plus whatever other data is needed to start the game. Users have to get their hands themselves for security reasons
      socket.on("StartGame", (data) => {
        dispatch("getHand", data.tableId)
        console.log(data)
      });
      socket.on("GetSeats", (id) => {
        dispatch("getSeats", id)
        console.log("Seat: seat")
      })
      socket.on("PlayerLeft", (id) => {
        commit("playerLeft", id)
      })


    },

    joinRoom({ commit, dispatch }, roomName) {
      socket.emit("dispatch", { action: "JoinRoom", data: roomName });
      dispatch("joinTable", roomName)
    },
    leaveRoom({ commit, dispatch }, roomName) {
      socket.emit("dispatch", { action: "LeaveRoom", data: roomName });
      dispatch("leaveTable", roomName)
    },
  }
})
