<template>
    <div class="file-metadata">
      <form>
      <text-field
        showLabel=false
        :classes=textFieldClasses
        :placeholder="titlePlaceholder"
        :editable="titleEditable"
        :value="title"
        :validator="validateTitle"
        :onChange="onTitleChange"/>
        <div class="field">
          <div class="control">
            <textarea
              class="textarea file-description"
              type="text"
              v-model="description"
              :disabled="!otherEditable"
              :placeholder="descriptionPlaceholder"></textarea>
          </div>
        </div>
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
import UploadModule from '../../vuexModules/UploadModule'
import ListModule from '../../vuexModules/ListModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import TitleFieldValidator from '../../vuexModules/validators/TitleFieldValidator'
import FfaFieldValidation from '../../vuexModules/validators/FfaFieldValidation'
import TaggersModule from '../../vuexModules/TaggersModule'
import { ProcessStatus } from '../../models/ProcessStatus'
import FileMetadataModule from '../../functionModules/components/FileMetadataModule'
import StartListingButton from '../listing/StartListingButton.vue'
import TextField from '@/components/ui/TextField.vue'
import FfaTagger from '../../components/ui/FfaTagger.vue'
import { Placeholders, Keys } from '../../util/Constants'
import uuid4 from 'uuid/v4'

import '@/assets/style/components/file-metadata.sass'

const vuexModuleName = 'uploadModule'

@Component({
  components: {
    TextField,
    FfaTagger,
  },
})
export default class FileMetadata extends Vue {

  public taggerKey = Keys.FILE_METADATA_KEY
  private title = ''
  private titlePlaceholder = Placeholders.TITLE
  private description = ''
  private descriptionPlaceholder = Placeholders.DESCRIPTION
  private titleEditable = true
  private otherEditable = true
  private textFieldClasses = ['title-input']
  private ethereumDisabled!: boolean

  public mounted(this: FileMetadata) {
    const listingsModule = getModule(FfaListingsModule, this.$store)
    listingsModule.fetchCandidates()
    this.$store.subscribe(this.vuexSubscriptions)
    console.log('FileMetadata mounted')
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
      case `${vuexModuleName}/setTitle`:
        if (mutation.payload !== null) {
          this.title = mutation.payload
        }
        return
      case `${vuexModuleName}/setStatus`:
        switch (mutation.payload) {
          case ProcessStatus.NotReady:
          case ProcessStatus.Ready:
            this.otherEditable = true
            return
          case ProcessStatus.Executing:
            this.otherEditable = false
            return
          case ProcessStatus.Complete:
          case ProcessStatus.Error:
          default:
           return
        }
      case `listModule/setStatus`:
        this.titleEditable = mutation.payload === ProcessStatus.Executing ? false : true
        return
      default:
        return
    }
  }

  @Watch('title')
  private onTitleChanged(newTitle: string, oldTitle: string) {
    const uploadModule = getModule(UploadModule, this.$store)
    const listModule = getModule(ListModule, this.$store)
    FileMetadataModule.titleChanged(newTitle, listModule, uploadModule)
  }

  @Watch('description')
  private onDescriptionChanged(newDescription: string, oldDescription: string) {
    const uploadModule = getModule(UploadModule, this.$store)
    uploadModule.setDescription(newDescription)
  }
}
</script>
