<template>
    <div class="file-metadata">
      <form>
        <div class="field">
          <div class="control">
            <input
              class="input"
              type="text"
              :disabled="!editable"
              v-model="filename"
              placeholder="Filename"/>
          </div>
        </div>
        <div class="field">
          <div class="control">
            <textarea
              class="textarea"
              type="text"
              :disabled="!editable"
              placeholder="Description"></textarea>
          </div>
        </div>
      </form>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import UploadModule from '../../modules/UploadModule'
import { ProcessStatus } from '../../models/ProcessStatus'
import uuid4 from 'uuid/v4'

import '@/assets/style/components/file-metadata.sass'

@Component
export default class FileUploader extends Vue {

  private uploadModule = getModule(UploadModule, this.$store)

  private filename = ''
  private description = ''
  private editable = true

  public mounted(this: FileUploader) {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case 'uploadModule/prepare': {
        if (mutation.payload !== null) {
          this.filename = mutation.payload.name
        }
        break
      }
      case 'uploadModule/setStatus': {
        switch (mutation.payload) {
          case ProcessStatus.Executing:
            this.editable = false
          case ProcessStatus.Complete:

            break
          case ProcessStatus.Error:

            break
          default:
            // nada
        }
      }
      default: {
        // do nothing
      }
    }
  }
}
</script>
