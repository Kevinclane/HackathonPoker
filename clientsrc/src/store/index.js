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
    highestBet: 0
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
    setSeats(state, seats) {
      state.activeTable.Seats = seats
    },
    setHighestBet(state, highestBet) {
      state.highestBet = highestBet
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

    async uploadProfilePicture({ commit }, img) {
      try {
        let apiObj = {
          img: img
        }
        let res = await api.put("/profile/pic", apiObj)
        debugger
        commit("setUser", res.data)
      } catch (error) {
        console.error(error)
      }
    },


    //#endregion ProfileStuff


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
        dispatch("findHighestBet", res.data.Seats)
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
        await api.put("/texasholdem/sit/" + reqObj.tableId, reqObj)

        socket.emit("texasholdem", {
          action: "getSeats", body: {
            tableId: reqObj.tableId
          }
        })
      } catch (error) {
        console.error(error)
      }
    },
    async getSeats({ commit, dispatch }, id) {
      try {
        let res = await api.get("/texasholdem/getseats/" + id)
        dispatch("findHighestBet", res.data)
        commit("setSeats", res.data)
      } catch (error) {
        console.error(error)
      }
    },
    async submitUserChoice({ }, choice) {
      try {
        choice.Bet.Escrow = parseInt(choice.Bet.Escrow)
        let res = await api.post("/texasholdem/userchoice/" + choice.Bet.TableId, choice)
        socket.emit("texasholdem", {
          action: "userChoice", body: choice
        })
      } catch (error) {
        console.error(error)
      }
    },
    //#endregion TxTables

    async deleteTable({ }, id) {
      try {
        let res = await api.delete("texasholdem/" + id)
        console.log(res.data)
      } catch (error) {
        console.error(error)
      }
    },

    findHighestBet({ commit }, seats) {
      let i = 0
      let highestBet = 0
      while (i < seats.length) {
        if (seats[i].Bet.Escrow > highestBet) {
          highestBet = seats[i].Bet.Escrow
        }
        i++
      }
      commit("setHighestBet", highestBet)
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
      socket.on("GetSeats", (id) => {
        dispatch("getSeats", id)
      })
      socket.on("GetGame", (tableId) => {
        dispatch("joinTable", tableId)
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
