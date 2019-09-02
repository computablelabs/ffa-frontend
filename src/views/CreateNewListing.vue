<template>
  <section id="create-new-listing" >
    <FlashMessage
      v-for="flash in flashes"
      :key="flash.id"
      :flash="flash"/>
    <div v-if="isReady">
      <div class="tile is-ancestor is-hcentered">
        <div class="tile is-ancestor is-8">
          <div class="tile is-2">
            <FileUploader />
            <FileLister />
          </div>
          <div class="tile">
            <FileMetadata/>
          </div>
        </div>
      </div>
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

import SharedModule from '../functionModules/components/SharedModule'
import EthereumModule from '../functionModules/ethereum/EthereumModule'

import { FlashType } from '../models/Flash'
import Flash from '../models/Flash'

import FlashMessage from '@/components/ui/FlashMessage.vue'
import EthereumLoader from '@/components/ui/EthereumLoader.vue'
import Status from '@/components/ui/Status.vue'
import FileUploader from '@/components/listing/FileUploader.vue'
import FileLister from '@/components/listing/FileLister.vue'
import FileMetadata from '@/components/listing/FileMetadata.vue'
import StartListingButton from '@/components/listing/StartListingButton.vue'

import Dropzone from 'dropzone'

import '@/assets/style/views/list.sass'
import '@/assets/style/components/file-uploader.sass'

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

  @Prop()
  public asdf?: string

  private flashesModule: FlashesModule = getModule(FlashesModule, this.$store)
  private appModule: AppModule = getModule(AppModule, this.$store)

  private created() {
    const web3Module = getModule(Web3Module, this.$store)
    const appModule = getModule(AppModule, this.$store)
    const flashesModule = getModule(FlashesModule, this.$store)

    EthereumModule.setEthereum(this.requiresWeb3!, this.requiresMetamask!, this.requiresParameters!,
      appModule, web3Module, flashesModule)
  }

  private mounted() {
    console.log('CreateNewListing mounted')
  }

  private get flashes() {
    return this.flashesModule.flashes
  }

  private get isReady(): boolean {
    const appModule = getModule(AppModule, this.$store)
    const web3Module = getModule(Web3Module, this.$store)

    return SharedModule.isReady(this.requiresWeb3!, this.requiresMetamask!, this.requiresParameters!,
      appModule, web3Module)
  }

  private async openDrawer() {
    await this.sleep(1000)
    this.$root.$emit('open-drawer')
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
</script>
