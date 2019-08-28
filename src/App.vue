<template>
  <div id="app">
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
import { Component, Vue } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import AppModule from './vuexModules/AppModule'
import FlashesModule from './vuexModules/FlashesModule'
import MetamaskModule from './functionModules/metamask/MetamaskModule'
import ParameterizerModule from './functionModules/protocol/ParameterizerModule'
import Web3Module from './vuexModules/Web3Module'
import FileUploaderModule from './functionModules/components/FileUploaderModule'
import '@/assets/style/ffa.sass'

@Component
export default class App extends Vue {
  public appModule: AppModule = getModule(AppModule, this.$store)
  public web3Module = getModule(Web3Module, this.$store)

  public async created() {
    console.log('mounted()')
    const flashesModule = getModule(FlashesModule, this.$store)

    if (FileUploaderModule.ethereumDisabled() || this.web3Module.web3.eth === undefined) {
      const enabled = await MetamaskModule.enableEthereum(flashesModule, this.web3Module)
    }
    this.appModule.setEthereumEnabled(true)
    await this.setParameters()
    console.log('handleCreate() complete')
  }

  public mounted(this: App) {
    console.log('App mounted')
  }

  public async setParameters() {
     let responses: number[]
     responses = await Promise.all([ParameterizerModule.getMakerPayment(ethereum.selectedAddress, this.web3Module, {}),
                                    ParameterizerModule.getCostPerByte(ethereum.selectedAddress, this.web3Module, {}),
                                    ParameterizerModule.getStake(ethereum.selectedAddress, this.web3Module, {}),
                                    ParameterizerModule.getPriceFloor(ethereum.selectedAddress, this.web3Module, {}),
                                    ParameterizerModule.getPlurality(ethereum.selectedAddress, this.web3Module, {}),
                                    ParameterizerModule.getVoteBy(ethereum.selectedAddress, this.web3Module, {}) ])
     const [ makerPayment, getCostPerByte, stake, priceFloor, plurality, voteBy ] = responses
  }
}
</script>
