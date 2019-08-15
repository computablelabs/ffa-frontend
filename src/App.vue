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
import { enableEthereum } from './util/Metamask'
import { getModule } from 'vuex-module-decorators'
import FlashesModule from './vuexModules/FlashesModule'
import MetaMaskModule from './vuexModules/MetaMaskModule'
import Web3Module from './vuexModules/Web3Module'
import FileUploaderModule from './functionModules/components/FileUploaderModule'
import '@/assets/style/ffa.sass'

@Component
export default class App extends Vue {
  public handleCreate() {
    const flashesModule = getModule(FlashesModule, this.$store)
    const metaMaskModule = getModule(MetaMaskModule, this.$store)
    const web3Module = getModule(Web3Module, this.$store)

    if (FileUploaderModule.ethereumDisabled()) {
      enableEthereum(flashesModule, metaMaskModule, web3Module)
    }
  }
}
</script>
