<template>
    <div class="file-metadata">
      <form>
      <text-field
        showLabel=false
        :classes=textFieldClasses
        :placeholder="titlePlaceholder"
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
              :placeholder="descriptionPlaceholder"></textarea>
          </div>
        </div>
        <StartListingButton />
        <ffa-tagger
          :taggerKey="taggerKey"/>
      </form>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import UploadModule from '../../modules/UploadModule'
import FfaListingsModule from '../../modules/FfaListingsModule'
import TitleFieldValidator from '../../modules/validators/TitleFieldValidator'
import FfaFieldValidation from '../../modules/validators/FfaFieldValidation'
import TaggersModule from '../../modules/TaggersModule'
import { ProcessStatus } from '../../models/ProcessStatus'
import StartListingButton from '../listing/StartListingButton.vue'
import TextField from '@/components/ui/TextField.vue'
import FfaTagger from '../../components/ui/FfaTagger.vue'
import uuid4 from 'uuid/v4'
import { Placeholders } from '../../util/Constants'

import '@/assets/style/components/file-metadata.sass'

@Component({
  components: {
    StartListingButton,
    TextField,
    FfaTagger,
  },
})
export default class FileMetadata extends Vue {

  private title = ''
  private titlePlaceholder = Placeholders.TITLE
  private description = ''
  private descriptionPlaceholder = Placeholders.DESCRIPTION
  private editable = true
  private textFieldClasses = ['title-input']
  private taggerKey = 'FileMetadata'

  public mounted(this: FileMetadata) {
    const listingsModule = getModule(FfaListingsModule, this.$store)
    listingsModule.fetchCandidates()
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
        return
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
        return
      }
    }
  }

  @Watch('title')
  private onTitleChanged(newTitle: string, oldTitle: string) {
    const uploadModule = getModule(UploadModule, this.$store)
    uploadModule.setTitle(newTitle)
  }

  @Watch('description')
  private onDescriptionChanged(newDescription: string, oldDescription: string) {
    const uploadModule = getModule(UploadModule, this.$store)
    uploadModule.setDescription(newDescription)
  }
}
</script>
