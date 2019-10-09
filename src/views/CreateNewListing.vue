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
          <button @click="openDrawer" class="start button is-large is-primary">
          Start Listing
          </button>
          <a class="help-text" href="">
            Learn more about listing
          </a>
        </div>
      </transition>
    </div>

    <EthereumLoader v-else />
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'

import FlashesModule from '../vuexModules/FlashesModule'
import Web3Module from '../vuexModules/Web3Module'
import AppModule from '../vuexModules/AppModule'
import UploadModule from '../vuexModules/UploadModule'
import DrawerModule, { DrawerState } from '../vuexModules/DrawerModule'

import SharedModule from '../functionModules/components/SharedModule'
import EthereumModule from '../functionModules/ethereum/EthereumModule'

import { FlashType } from '../models/Flash'
import Flash from '../models/Flash'

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

  @Prop({ default: false })
  public requiresWeb3?: boolean

  @Prop({ default: false })
  public requiresMetamask?: boolean

  @Prop({ default: false })
  public requiresParameters?: boolean

  private flashesModule: FlashesModule = getModule(FlashesModule, this.$store)
  private appModule: AppModule = getModule(AppModule, this.$store)
  private web3Module: Web3Module = getModule(Web3Module, this.$store)
  private uploadModule = getModule(UploadModule, this.$store)
  private drawerModule = getModule(DrawerModule, this.$store)

  private created() {
    EthereumModule.setEthereum(this.requiresWeb3!, this.requiresMetamask!, this.requiresParameters!,
      this.$store)
  }

  private mounted() {
    console.log('CreateNewListing mounted')
  }

  private get flashes() {
    return this.flashesModule.flashes
  }

  private get isReady(): boolean {
    return SharedModule.isReady(this.requiresWeb3!, this.requiresMetamask!, this.requiresParameters!,
      this.$store)
  }

  private get showMetadataForm(): boolean {
    return this.uploadModule.file !== FileHelper.EmptyFile
  }

  private async openDrawer() {
    this.drawerModule.setDrawerState(DrawerState.processing)
    this.$root.$emit('open-drawer')
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
</script>
