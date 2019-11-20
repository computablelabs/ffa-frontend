<template>
  <div id="app">

    <navigation />

    <FlashMessage
      v-for="flash in flashes"
      :key="flash.id"
      :flash="flash"/>

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
import FlashesModule from './vuexModules/FlashesModule'

import RouterTransitionModule from './functionModules/router/RouterTransitionModule'
import JwtModule from './functionModules/jwt/JwtModule'
import EthereumModule from './functionModules/ethereum/EthereumModule'

import { EthereumNetwork } from './models/EthereumNetwork'
import Flash, { FlashType } from './models/Flash'

import Servers from './util/Servers'
import StringHelper from './util/StringHelper'

import FlashMessage from './components/ui/FlashMessage.vue'
import TaskPollerManager from './components/task/TaskPollerManager.vue'

import JsCookie from 'js-cookie'
import JsonWebToken from 'jsonwebtoken'

import '@/assets/style/ffa.sass'
import '@/assets/style/fonts.css'

@Component({
  components: {
    FlashMessage,
    TaskPollerManager,
  },
})
export default class App extends Vue {

  public appModule = getModule(AppModule, this.$store)
  public flashesModule = getModule(FlashesModule, this.$store)

  public get flashes() {
    return this.flashesModule.flashes
  }

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

  public mounted() {

    if (ethereum) {
      const siteNetwork = StringHelper.capitalize(process.env.VUE_APP_NETWORK_NAME!)
      const ethereumNetwork = EthereumModule.getCurrentNetwork()
      const ethereumNetworkName = EthereumNetwork[ethereumNetwork] as keyof typeof EthereumNetwork
      if (siteNetwork !== ethereumNetworkName) {
        let warning = 'Network mismatch! '
        warning += `You are using Computable DAO on the ${siteNetwork} network `
        warning += `but your Metamask is connected to the ${ethereumNetworkName} network.`
        this.flashesModule.append(new Flash(warning, FlashType.warning))
      }
    }

    const jwt = JsCookie.get('jwt')
    if (!!!jwt) {
      return this.appModule.setJwt(null)
    }

    if (JwtModule.isJwtValid(jwt, this.appModule.web3)) {
      this.appModule.setJwt(jwt)
    } else {
      this.appModule.setJwt(null)
    }

    console.log('App mounted')
  }
}
</script>
