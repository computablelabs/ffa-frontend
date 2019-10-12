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
import NewListingModule from '../../vuexModules/NewListingModule'
import UploadModule from '../../vuexModules/UploadModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import EventModule from '../../vuexModules/EventModule'

import FileListerModule from '../../functionModules/components/FileListerModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import FileUploaderModule from '../../functionModules/components/FileUploaderModule'

import { Eventable } from '../../interfaces/Eventable'

import FfaListing from '../../models/FfaListing'
import { ProcessStatus } from '../../models/ProcessStatus'
import Flash, { FlashType } from '../../models/Flash'

import { Errors, Labels, Messages } from '../../util/Constants'

import Web3 from 'web3'
import uuid4 from 'uuid/v4'

const vuexModuleName = 'newListingModule'

@Component
export default class FileLister extends Vue {

  public processId!: string
  public newListingModule: NewListingModule = getModule(NewListingModule, this.$store)
  public ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)
  public flashesModule: FlashesModule = getModule(FlashesModule, this.$store)

  public mounted(this: FileLister) {
    this.$store.subscribe(this.vuexSubscriptions)
    console.log('FileLister mounted')
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case `${vuexModuleName}/setStatus`:
        switch (mutation.payload) {
          case ProcessStatus.Executing:
            this.processId = uuid4()
            this.ffaListingsModule.addPending(this.newListingModule.listing)
            FileListerModule.list(this.processId, this.$store)
            return
          default:
            return
        }
      case 'eventModule/append':
        if (!EventableModule.isEventable(mutation.payload)) { return }

        const event = mutation.payload as Eventable

        if (!!event.error) {
          return this.flashesModule.append(
            new Flash(
              mutation.payload.error,
              FlashType.error,
            ),
          )
        }

        return FileListerModule.success(event, this.$store)

      default:
        return
    }
  }
}
</script>
