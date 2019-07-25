<template>
  <div class="file-metadata">
    <form>
      <!--
      <div class="field">
        <div class="control">
          <input
            class="input file-title"
            type="text"
            v-model="title"
            :disabled="!editable"
            placeholder="Title"/>
        </div>
      </div>
      -->
      <text-field
        label="Title"
        showLabel=false
        :classes=textFieldClasses
        placeholder="placeholder"
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
import TitleFieldValidator from '../../modules/validators/TitleFieldValidator'
import FfaFieldValidation from '../../modules/validators/FfaFieldValidation'
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

  private title = ''
  private description = ''
  private editable = true
  private textFieldClasses = ['title-input']

  public mounted(this: FileMetadata) {
    const listingsModule = getModule(FfaListingsModule, this.$store)
    listingsModule.fetchUploads()
    this.$store.subscribe(this.vuexSubscriptions)
  }

  public validateTitle(title: string): FfaFieldValidation {
    const validator = new TitleFieldValidator('title', title, this.$store)
    return validator.validate()
  }

  public onTitleChange(newTitle: string) {
    const uploadModule = getModule(UploadModule, this.$store)
    uploadModule.setTitle(newTitle)
    // TODO: recompute and update the module's hash
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

  @Watch('description')
  private onDescriptionChanged(newDescription: string, oldDescription: string) {
    const uploadModule = getModule(UploadModule, this.$store)
    uploadModule.setDescription(newDescription)
  }
}
</script>
