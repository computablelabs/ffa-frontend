<template>
  <div class="list">
    <!-- just some bulma layout components -->
    <div class="container">
      <flash
        v-if='message != null'
        v-bind:flashType='flashType'
        v-bind:message='message'/>
      <div class="tile is-ancestor">
        <div class="tile is-4 is-hcentered">
          <img class="dummy-image" src="https://upload.wikimedia.org/wikipedia/en/thumb/8/86/FFA_Emblem_Feb_2015.svg/220px-FFA_Emblem_Feb_2015.svg.png">
        </div>
        <div class="tile is-vcentered">
          <h1>This is the placeholder List page</h1>
        </div>
      </div>
      <div class="tile is-ancestor is-hcentered">
        <div class="tile is-4 is-vcentered">
          <div class="box">
            <form action="/file-upload" class="dropzone" ref="dropzone">
              <div class="fallback">
                <input name="file" type="file" multiple />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Flash from '@/components/ui/Flash.vue'
import Dropzone from 'dropzone'

Dropzone.prototype.defaultOptions.dictDefaultMessage = 'Some customized message like "Drop yo wa4r3z here"'

@Component({
   components: {
    Flash,
  },
})
export default class List extends Vue {

  dropzoneClass = 'dropzone'
  dropzoneRef = 'dropzone'

  get message() {
    return 'Some kind of message.'
  }

  get flashType() {
    return 'warning'
  }

  public mounted(this: List) {
    var _dropzone: Dropzone
    let dropzoneClass = `.${this.dropzoneClass}`

    if (document.getElementsByClassName(this.dropzoneClass)) {
      console.log(document.getElementsByClassName(this.dropzoneClass))
      _dropzone = new Dropzone(dropzoneClass, {
        url: '/file/post',
        paramName: 'file',
        maxFiles: 1,
      })
    }
  }
}
</script>
