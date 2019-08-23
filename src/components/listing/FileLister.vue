<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'

import { getModule } from 'vuex-module-decorators'
import Web3Module from '../../vuexModules/Web3Module'
import FlashesModule from '../../vuexModules/FlashesModule'
import ListModule from '../../vuexModules/ListModule'
import UploadModule from '../../vuexModules/UploadModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'

import ListingModule from '../../functionModules/protocol/ListingModule'
import FileListerModule from '../../functionModules/components/FileListerModule'

import FfaListing from '../../models/FfaListing'
import { ProcessStatus } from '../../models/ProcessStatus'

import { Errors, Labels, Messages } from '../../util/Constants'

import Web3 from 'web3'

const vuexModuleName = 'listModule'

@Component
export default class FileLister extends Vue {

  public mounted(this: FileLister) {
    this.$store.subscribe(this.vuexSubscriptions)
    console.log('FileLister mounted')
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case `${vuexModuleName}/setStatus`:
        switch (mutation.payload) {
          case ProcessStatus.Executing:
            const web3Module = getModule(Web3Module, this.$store)
            const flashesModule = getModule(FlashesModule, this.$store)
            const listModule = getModule(ListModule, this.$store)
            const uploadModule = getModule(UploadModule, this.$store)
            FileListerModule.list(web3Module, flashesModule, listModule, uploadModule)
            return
          default:
            return
        }
      default:
        return
    }
  }
}
</script>
