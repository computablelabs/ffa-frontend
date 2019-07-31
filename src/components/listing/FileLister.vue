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
import Listing from '../../models/protocol/Listing'
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

  public vuexSubscriptions(mutation: MutationPayload, state: any) {
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

  public listCallback(usuallyUndefined: any, response: any) {
    const listModule = getModule(ListModule, this.$store)
    if (response.error) {
      listModule.setStatus(ProcessStatus.Error)
      return
    }

    listModule.setPercentComplete(100)
    listModule.setStatus(ProcessStatus.Complete)

    const ffaListingsModule = getModule(FfaListingsModule, this.$store)
    listModule.listing.transactionHash = response.result
    console.log(`ethereum transaction hash: ${listModule.listing.transactionHash}`)
    ffaListingsModule.addCandidate(listModule.listing)
  }

  public async list() {
    const listModule = getModule(ListModule, this.$store)
    const web3Module = getModule(Web3Module, this.$store)
    const metaMaskModule = getModule(MetaMaskModule, this.$store)
    const web3 = web3Module.web3
    const listing = new Listing()
    await listing.init(web3)
    listModule.setPercentComplete(50)
    // TODO: validate the listing?
    const listingHash = listModule.listing.hash
    console.log(`Calling protocol Listing::list() with hash ${listingHash}`)
    await listing.list(listingHash, this.listCallback)
  }
}
</script>
