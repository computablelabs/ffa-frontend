<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import ListModule from '../../modules/ListModule'
import Web3Module from '../../modules/Web3Module'
import MetaMaskModule from '../../modules/MetaMaskModule'
import FfaListingsModule from '../../modules/FfaListingsModule'
import ListingModule from '../../functionModules/protocol/ListingModule'
import FfaListing from '../../models/FfaListing'
import { ProcessStatus } from '../../models/ProcessStatus'
import { Errors, Labels, Messages } from '../../util/Constants'
import Web3 from 'web3'

const vuexModuleName = 'listModule'

@Component
export default class FileLister extends Vue {

  public mounted(this: FileLister) {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case `${vuexModuleName}/setStatus`: {
        switch (mutation.payload) {
          case ProcessStatus.Executing:
            this.list()
            break
          default:
            break
        }
      }
      default: {
        break
      }
    }
  }

  private async list() {
    const listModule = getModule(ListModule, this.$store)
    const web3Module = getModule(Web3Module, this.$store)
    const ffaListingsModule = getModule(FfaListingsModule, this.$store)
    const web3 = web3Module.web3
    try {
      listModule.setPercentComplete(50)
      // TODO: validate the listing?

      const transactionHash = await ListingModule.list(
        ethereum.selectedAddress,
        web3,
        listModule.listing.hash,
        {})

      listModule.setPercentComplete(100)
      listModule.setStatus(ProcessStatus.Complete)
      ffaListingsModule.addCandidate(listModule.listing)
    } catch {
      listModule.setStatus(ProcessStatus.Error)
    }
  }
}
</script>
