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

    async changeName({ commit }, profile) {
      try {
        let res = await api.put("/profile/changename", profile)
        commit("setUser", res.data)
      } catch (error) {
        console.error(error)
      }
    },
    async changeCardBack({ commit }, obj) {
      try {
        let res = await api.put("/profile/changecardback", obj)
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
    async sit({ commit, dispatch }, reqObj) {
      try {
        await api.put("/texasholdem/sit/" + reqObj.tableId, reqObj)
        dispatch("getProfile")
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
    async deleteTable({ }, id) {
      try {
        let res = await api.delete("texasholdem/" + id)
        console.log(res.data)
      } catch (error) {
        console.error(error)
      }
    },
    async leaveTable({ commit }, idObj) {
      try {
        await api.put("/texasholdem/leavetable/" + idObj.tableId, idObj)
      } catch (error) {
        console.error(error)
      }
    },
    //#endregion TxTables


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

    async hardReset({ }, id) {
      try {
        socket.emit("texasholdem", {
          action: "hardReset",
          body: {
            tableId: id
          }
        })
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
      socket.on("CONNECTED", (data) => {
        console.log(data.message)
      });
      socket.on("GetSeats", (id) => {
        dispatch("getSeats", id)
      })
      socket.on("GetGame", (tableId) => {
        dispatch("joinTable", tableId)
      })
      socket.on("SetGame", (table) => {
        commit("setActiveTable", table)
      })
      socket.on("resetting", () => {
        swal("Someone reset the game. Please wait for it to reload.");
        router.push({ name: "dashboard" });
      })

    },

    joinRoom({ commit, dispatch }, roomName) {
      socket.emit("dispatch", { action: "JoinRoom", data: roomName });
      dispatch("joinTable", roomName)
    },
    leaveRoom({ commit, dispatch }, idObj) {
      socket.emit("dispatch", { action: "LeaveRoom", data: idObj });
      // dispatch("leaveTable", roomName)
    },
  }
})
