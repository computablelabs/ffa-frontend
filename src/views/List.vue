<template>
  <section id="list">
    <flashMessage
      v-for='flash in flashes'
      v-bind:key='flash.id'
      v-bind:flash='flash' />
    <div class="tile is-ancestor">
      <div class="tile is-4 is-hcentered">
        <img
          class="dummy-image"
          src="https://upload.wikimedia.org/wikipedia/en/thumb/8/86/FFA_Emblem_Feb_2015.svg/220px-FFA_Emblem_Feb_2015.svg.png"/>
      </div>
      <div class="tile is-vcentered">
        <h1>This is the placeholder List page</h1>
      </div>
    </div>
    <div class="tile is-ancestor is-hcentered">
      <div class="tile is-4 is-vcentered">
        <div class="box">
          <form action="/file-upload" class="dropzone">
            <div class="fallback">
              <input name="file" type="file" multiple />
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import flashes from '../modules/FlashesModule'
// import flashesStore from '@/store/flashes/flashesStore'
import { FlashType } from '../models/Flash'
import Flash from '../models/Flash'
import FlashMessage from '@/components/ui/FlashMessage.vue'
import Dropzone from 'dropzone'

import '@/assets/style/views/list.sass'

Dropzone.prototype.defaultOptions.dictDefaultMessage = 'Some customized message like "Drop yo wa4r3z here"'

@Component({
   components: {
    FlashMessage,
  },
})
export default class List extends Vue {

  protected dropzoneClass = 'dropzone'
  protected dropzoneRef = 'dropzone'
  protected dropzone!: Dropzone

  get flashes() {
    const flashesModule = getModule(flashes, this.$store)
    return flashesModule.flashes
  }

  public mounted(this: List) {
    const dropzoneClass = `.${this.dropzoneClass}`

    // if (document.getElementsByClassName(this.dropzoneClass) &&
    //   !this.dropzone) {
      // this.dropzone = new Dropzone(dropzoneClass, {
      //   url: '/file/post',
      //   paramName: 'file',
      //   maxFiles: 1,
      // })
    // }
    const flashesModule = getModule(flashes, this.$store)
    console.log(FlashType.warning)
    const flash = new Flash('foo', FlashType.warning)
    flashesModule.append(flash)
  }
}
</script>
