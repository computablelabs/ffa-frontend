<template>
  <div id="app">
    <h1>{{ foo }}</h1>
    <navigation />
    <div class="view">
      <router-view />
    </div>
    <drawer :isOpen="false">
      <router-view name="drawer" />
    </drawer>
  </div>
</template>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import AppModule from './vuexModules/AppModule'
import FlashesModule from './vuexModules/FlashesModule'
import Web3Module from './vuexModules/Web3Module'
import MetamaskModule from './functionModules/metamask/MetamaskModule'
import ParameterizerModule from './functionModules/protocol/ParameterizerModule'
import FileUploaderModule from './functionModules/components/FileUploaderModule'
import { FfaListingStatus } from './models/FfaListing'

import '@/assets/style/ffa.sass'

@Component
export default class App extends Vue {
  public appModule: AppModule = getModule(AppModule, this.$store)
  public web3Module = getModule(Web3Module, this.$store)

  @Prop()
  private foo!: string

  public async created() {
    console.log('App created')
  }

  public mounted(this: App) {
    console.log('App mounted')
  }

}
</script>
