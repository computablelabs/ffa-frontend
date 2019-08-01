<template>
  <section id="list">
    <flashMessage
      v-for="flash in flashes"
      :key="flash.id"
      :flash="flash"/>
    <div class="tile is-ancestor is-hcentered">
      <div class="tile is-ancestor is-8">
        <div class="tile is-2">
          <fileUploader />
          <fileLister />
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
import FileUploader from '@/components/listing/FileUploader.vue'
import FileLister from '@/components/listing/FileLister.vue'
import FileMetadata from '@/components/listing/FileMetadata.vue'
import Status from '@/components/ui/Status.vue'
import Dropzone from 'dropzone'
import StartListingButton from '../components/listing/StartListingButton.vue'
import MetaMaskModule from '../modules/MetaMaskModule'
import Web3Module from '../modules/Web3Module'
import Listing from '../models/protocol/Listing'
import MetaMask from '../models/MetaMask'

import '@/assets/style/views/list.sass'
import '@/assets/style/components/file-uploader.sass'

@Component({
   components: {
    FlashMessage,
    FileUploader,
    FileLister,
    FileMetadata,
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

  private async openDrawer() {
    await this.sleep(1000)
    this.$root.$emit('open-drawer')
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
</script>
