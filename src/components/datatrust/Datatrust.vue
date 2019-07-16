<template>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'

@Component
export default class List extends Vue {

  // get flashes() {
  //   const flashesModule = getModule(flashes, this.$store)
  //   return flashesModule.flashes
  // }

  public mounted(this: List) {
    // if (document.getElementsByClassName(this.dropzoneClass) &&
    //   !this.dropzone) {
      // this.dropzone = new Dropzone(dropzoneClass, {
      //   url: '/file/post',
      //   paramName: 'file',
      //   maxFiles: 1,
      // })
    // }
  }
}
</script>
