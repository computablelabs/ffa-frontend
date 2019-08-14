<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import ListModule from '../../vuexModules/ListModule'
import UploadModule from '../../vuexModules/UploadModule'
import Web3Module from '../../vuexModules/Web3Module'
import MetaMaskModule from '../../vuexModules/MetaMaskModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import ListingModule from '../../functionModules/protocol/ListingModule'
import FfaListing from '../../models/FfaListing'
import { ProcessStatus } from '../../models/ProcessStatus'
import { Errors, Labels, Messages } from '../../util/Constants'
import FileListerModule from '../../../src/functionModules/components/FileListerModule'
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
            FileListerModule.list()
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
}
</script>
