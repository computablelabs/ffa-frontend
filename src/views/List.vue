<template>
  <section id="list">
    <flashMessage
      v-for='flash in flashes'
      v-bind:key='flash.id'
      v-bind:flash='flash' />
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

import '@/assets/style/views/list.sass'

@Component({
   components: {
    FlashMessage,
    FileUploader,
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

  public mounted(this: List) {
    const dropzoneClass = `.${this.dropzoneClass}`
    const flashesModule = getModule(FlashesModule, this.$store)
    const flash = new Flash('an urgent warning from the future', FlashType.warning)
    flashesModule.append(flash)
    // this.openDrawer()
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
