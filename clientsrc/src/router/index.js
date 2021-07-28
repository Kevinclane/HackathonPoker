import Vue from 'vue'
import Router from 'vue-router'
// @ts-ignore
import Home from '../views/Home.vue'
import TexasHoldEmTable from "../views/TexasHoldEmTable.vue"
import Dashboard from "../views/Dashboard.vue"
import TxLobby from "../views/TxLobby.vue"
import { authGuard } from "@bcwdev/auth0-vue"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: "/dashboard",
      name: 'dashboard',
      component: Dashboard,
      beforeEnter: authGuard
    },
    {
      path: "/texasholdemtable/:tableId",
      name: 'texasholdemtable',
      component: TexasHoldEmTable,
      beforeEnter: authGuard
    }, {
      path: "/txlobby",
      name: "txlobby",
      component: TxLobby,
      beforeEnter: authGuard
    },
    {
      path: "*",
      redirect: '/'
    }
  ]
})