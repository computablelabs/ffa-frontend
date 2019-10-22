<template>
  <section id="create-new-listing" >

    <FlashMessage
      v-for="flash in flashes"
      :key="flash.id"
      :flash="flash"/>

    <div v-if="isReady" class="container new-listing-container">
      <FileUploader />
      <FileLister />
      <transition name="create-new-listing-transition">
        <div class="metadata-container" v-if="showMetadataForm">
          <FileMetadata />
          <button
            @click="openDrawer"
            class="start button is-large is-primary"
            :disabled="buttonDisabled">
          Start Listing
          </button>
        </div>
      </transition>
    </div>

    <EthereumLoader v-else />
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import FlashesModule from '../vuexModules/FlashesModule'
import AppModule from '../vuexModules/AppModule'
import UploadModule from '../vuexModules/UploadModule'
import DrawerModule, { DrawerState } from '../vuexModules/DrawerModule'

import SharedModule from '../functionModules/components/SharedModule'
import EthereumModule from '../functionModules/ethereum/EthereumModule'

import { OpenDrawer } from '../models/Events'

import { FlashType } from '../models/Flash'
import Flash from '../models/Flash'
import { ProcessStatus } from '../models/ProcessStatus'

import FileHelper from '../util/FileHelper'

import FlashMessage from '@/components/ui/FlashMessage.vue'
import EthereumLoader from '@/components/ui/EthereumLoader.vue'
import Status from '@/components/ui/Status.vue'
import FileUploader from '@/components/listing/FileUploader.vue'
import FileLister from '@/components/listing/FileLister.vue'
import FileMetadata from '@/components/listing/FileMetadata.vue'

import Dropzone from 'dropzone'

import '@/assets/style/views/create-new-listing.sass'

@Component({
   components: {
    FlashMessage,
    FileUploader,
    FileLister,
    FileMetadata,
    EthereumLoader,
  },
})
export default class CreateNewListing extends Vue {

  private get flashes() {
    return this.flashesModule.flashes
  }

  private get showMetadataForm(): boolean {
    return this.uploadModule.file !== FileHelper.EmptyFile
  }

  get buttonDisabled() {
    if (this.drawerStatus === DrawerState.processing) {
      // drawer is open
      return true
    }

    // drawer is closed. Disabled until both title and description
    // are set
    return this.newListingStatus === ProcessStatus.NotReady
  }

  @Prop({ default: false })
  public requiresWeb3?: boolean

  @Prop({ default: false })
  public requiresMetamask?: boolean

  @Prop({ default: false })
  public requiresParameters?: boolean

  public isReady = false

  private flashesModule: FlashesModule = getModule(FlashesModule, this.$store)
  private appModule: AppModule = getModule(AppModule, this.$store)
  private uploadModule = getModule(UploadModule, this.$store)
  private drawerModule = getModule(DrawerModule, this.$store)
  private newListingStatus = ProcessStatus.NotReady
  private drawerStatus = DrawerState.beforeProcessing

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case 'newListingModule/setStatus':
        this.newListingStatus = mutation.payload
        return
      case 'drawerModule/setDrawerState':
        this.drawerStatus = mutation.payload
        return
      case 'appModule/setAppReady':
        this.isReady = mutation.payload
      default:
        return
    }
  }

  private created() {
    this.isReady = getModule(AppModule, this.$store).appReady
    if (this.isReady) {
      return
    }
    EthereumModule.setEthereum(this.requiresWeb3!, this.requiresMetamask!, this.requiresParameters!,
      this.$store)
  }

  private mounted() {
    this.$store.subscribe(this.vuexSubscriptions)
    console.log('CreateNewListing mounted')
  }

  private async openDrawer() {
    this.drawerModule.setDrawerState(DrawerState.processing)
    this.drawerModule.setDrawerCanClose(true)
    this.$root.$emit(OpenDrawer)
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
</script>
