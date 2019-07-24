<template>
    <div class="file-metadata">
      <form>

      <text-field
        :label="textFieldLabel"
        :classes=textFieldClasses
        :placeholder="textFieldPlaceholder"
        :editable="editable"
        :value="title"
        :validator="validateTitle"
        :onChange="onTitleChange"/>        
	<div class="field">
          <div class="control">
            <textarea
              class="textarea file-description"
              type="text"
              v-model="description"
              :disabled="!editable"
              placeholder="Description"></textarea>
          </div>
        </div>
        <StartListingButton />
      </form>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import UploadModule from '../../modules/UploadModule'
import FfaListingsModule from '../../modules/FfaListingsModule'
import { ProcessStatus } from '../../models/ProcessStatus'
import TextField from '@/components/ui/TextField.vue'
import uuid4 from 'uuid/v4'
import StartListingButton from '../datatrust/StartListingButton.vue'

import '@/assets/style/components/file-metadata.sass'

@Component({
  components: {
    StartListingButton,
    TextField,
  },
})@Component
export default class FileMetadata extends Vue {

  private uploadModule = getModule(UploadModule, this.$store)
  private listingsModule = getModule(FfaListingsModule, this.$store)

  private title = ''
  private description = ''
  private editable = true
  private textFieldClasses = ['foo', 'bar']
  private textFieldLabel = 'label'
  private textFieldPlaceholder = 'placeholderrr'

  public mounted(this: FileMetadata) {
    this.listingsModule.fetchUploads()
    this.$store.subscribe(this.vuexSubscriptions)
  }

    // TODO: implement validation types elsewhere
  public validateTitle(title: string): any {
    const valid = this.listingsModule.uploadedTitles.indexOf(title) < 0
    const errorMessage = valid ? '' : `Title '${title}' already in use.`
    return {
      valid,
      errorMessage,
    }
  }

  public onTitleChange(newTitle: string) {
    const uploadModule = getModule(UploadModule, this.$store)
    uploadModule.setTitle(newTitle)
    this.title = uploadModule.title
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case 'uploadModule/prepare': {
        if (mutation.payload !== null) {
          this.title = mutation.payload.name
        }
        break
      }
      case 'uploadModule/setStatus': {
        switch (mutation.payload) {
          case ProcessStatus.NotReady:
          case ProcessStatus.Ready:
            this.editable = true
            break
          case ProcessStatus.Executing:
            this.editable = false
            break
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

  // @Watch('title')
  // private onTitleChanged(newTitle: string, oldTitle: string) {
  //   const uploadModule = getModule(UploadModule, this.$store)
  //   uploadModule.setTitle(newTitle)
  // }

  @Watch('description')
  private onDescriptionChanged(newDescription: string, oldDescription: string) {
    const uploadModule = getModule(UploadModule, this.$store)
    uploadModule.setDescription(newDescription)
  }
}
</script>
