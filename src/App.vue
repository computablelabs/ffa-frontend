<template>
  <div id="app">
    <navigation />
    <div class="view">
      <router-view />
    </div>
    <drawer :isOpen="false">
      <router-view name="drawer" />
    </drawer>
    <TaskPollerManager />
  </div>
</template>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Route } from 'vue-router'
import { getModule } from 'vuex-module-decorators'
import AppModule from './vuexModules/AppModule'

import RouterTransitionModule from './functionModules/router/RouterTransitionModule'
import JwtModule from './functionModules/jwt/JwtModule'
import EthereumModule from './functionModules/ethereum/EthereumModule'

import Servers from './util/Servers'

import TaskPollerManager from './components/task/TaskPollerManager.vue'

import JsCookie from 'js-cookie'
import JsonWebToken from 'jsonwebtoken'

import '@/assets/style/ffa.sass'
import '@/assets/style/fonts.css'

@Component({
  components: {
    TaskPollerManager,
  },
})
export default class App extends Vue {

  public appModule = getModule(AppModule, this.$store)

  public async created() {

    this.$router.beforeEach((to: Route, from: Route, next: (val: any) => void) => {
      next(RouterTransitionModule.beforeTransition(to, from, this))
    })

    this.$router.afterEach((to: Route, from: Route) => {
      RouterTransitionModule.afterTransition(to, from, this)
    })

    this.appModule.initializeWeb3(Servers.EthereumJsonRpcProvider)

    console.log('App created')
  }

  public mounted(this: App) {
    console.log('App mounted')

    const jwt = JsCookie.get('jwt')
    if (!!!jwt) {
      return this.appModule.setJwt(null)
    }

    if (JwtModule.isJwtValid(jwt, this.appModule.web3)) {
      this.appModule.setJwt(jwt)
    } else {
      this.appModule.setJwt(null)
    }

  }
}
</script>
