<template>
  <div class="image" v-bind:class="iconClassObject" />
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import FileHelper from '../../util/FileHelper'

import '@/assets/style/ui/file-icon.sass'

@Component
export default class FileIcon extends Vue {

  // defined in FileHelper
  @Prop()
  public fileIconType!: string

  get iconClassObject(): object {
    switch (this.fileIconType) {
      case FileHelper.FileIcon:
        return { fileIcon: true }
      case FileHelper.ImageIcon:
        return { imageIcon: true }
      case FileHelper.AudioIcon:
        return { audioIcon: true }
      case FileHelper.VideoIcon:
        return { videoIcon: true }
      case FileHelper.PdfIcon:
        return { pdfIcon: true }
      case FileHelper.ArchiveIcon:
        return { archiveIcon: true }
      case FileHelper.UnknownType:
        return { unknownTypeIcon: true }
      default:
        return { unknownTypeIcon: true }
    }
  }
}
</script>






