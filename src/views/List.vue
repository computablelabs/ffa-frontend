<template>
  <section id="list">
    <flashMessage
      v-for="flash in flashes"
      :key="flash.id"
      :flash="flash"/>
    <div class="tile is-ancestor is-hcentered">
      <div class="tile is-ancestor is-8">
        <div class="tile is-vcentered is-2">
          <fileUploader />
        </div>
        <div class="tile">
          <fileMetadata />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import FlashesModule from '../modules/FlashesModule'
import { FlashType } from '../models/Flash'
import Flash from '../models/Flash'
import FlashMessage from '@/components/ui/FlashMessage.vue'
import FileUploader from '@/components/datatrust/FileUploader.vue'
import FileMetadata from '@/components/datatrust/FileMetadata.vue'
import Status from '@/components/ui/Status.vue'
import Dropzone from 'dropzone'
import StartListingButton from '../components/datatrust/StartListingButton.vue'
import MetaMaskModule from '../modules/MetaMaskModule'
import Web3Module from '../modules/Web3Module'
import Listing from '../models/protocol/Listing'
import MetaMask from '../models/MetaMask'

import '@/assets/style/views/list.sass'

@Component({
   components: {
    FlashMessage,
    FileUploader,
    FileMetadata,
    StartListingButton,
  },
})
export default class List extends Vue {

  protected dropzoneClass = 'dropzone'
  protected dropzoneRef = 'dropzone'
  protected dropzone!: Dropzone

  get flashes() {
    const flashesModule = getModule(FlashesModule, this.$store)
    return flashesModule.flashes
  }

  public async mounted(this: List) {
    const dropzoneClass = `.${this.dropzoneClass}`
    const flashesModule = getModule(FlashesModule, this.$store)
    const flash = new Flash('an urgent warning from the future', FlashType.warning)
    flashesModule.append(flash)

    const metaMaskModule = getModule(MetaMaskModule, this.$store)

    // experimental web3 initialization code
    // TODO: figure out what validation is necessary for the ethereum object
    const web3Module = getModule(Web3Module, this.$store)
    web3Module.initialize(ethereum)
    const web3 = web3Module.web3
    const listing = new Listing(metaMaskModule.address)
    const isListed = await listing.isListed('0x0x5c237758dd820D25F00f0D29fDF6a0490502e624')
    debugger
    // account 1: 0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048
    // account 2: 0x6Ea5A9CfD540442568B4e6C95418265551b36718
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
