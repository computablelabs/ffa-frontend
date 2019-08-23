<template>
  <div id="app">
    <navigation />
    <div class="view">
      <router-view @created="handleCreate" />
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
import { Component, Vue } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import AppModule from './vuexModules/AppModule'
import FlashesModule from './vuexModules/FlashesModule'
import MetamaskModule from './functionModules/metamask/MetamaskModule'
import Web3Module from './vuexModules/Web3Module'
import FileUploaderModule from './functionModules/components/FileUploaderModule'
import '@/assets/style/ffa.sass'

@Component
export default class App extends Vue {

  public async handleCreate() {
    console.log('handleCreate()')
    const appModule = getModule(AppModule, this.$store)
    const flashesModule = getModule(FlashesModule, this.$store)
    const web3Module = getModule(Web3Module, this.$store)

    if (FileUploaderModule.ethereumDisabled() || web3Module.web3.eth === undefined) {
      const enabled = await MetamaskModule.enableEthereum(flashesModule, web3Module)
    }
    appModule.setAppReady(true)
    console.log('handleCreate() complete')
  }

  public mounted(this: App) {
    console.log('App mounted')
  }
}
</script>
