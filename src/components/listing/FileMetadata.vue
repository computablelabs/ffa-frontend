<template>
  <div class="file-metadata">
    <form>
    <text-field
      showLabel=false
      :classes=titleFieldClasses
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
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'
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
import FfaTagger from '@/components/ui/FfaTagger.vue'

import { Placeholders, Keys } from '../../util/Constants'

import '@/assets/style/components/file-metadata.sass'
import { OpenDrawer } from '../../models/Events'
import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'

const uploadVuexModule = 'uploadModule'
const listVuexModule = 'listModule'
const appVuexModule = 'appModule'

@Component({
  components: {
    TextField,
    FfaTagger,
  },
})
export default class FileMetadata extends Vue {

  get isViewOnly(): boolean {
    return !!this.viewOnly
  }

  public taggerKey = Keys.FILE_METADATA_KEY

  @Prop()
  public viewOnly!: boolean

  private title = ''
  private titleFieldClasses = ['title-input']
  private titlePlaceholder = Placeholders.TITLE
  private titleEditable = true

  private description = ''
  private descriptionPlaceholder = Placeholders.DESCRIPTION

  private otherEditable = true

  public created(this: FileMetadata) {
    this.$store.subscribe(this.vuexSubscriptions)
    this.setAllEditable(false)
    if (!this.isViewOnly) {
      this.setAllEditable(true)
    }
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
      case `${uploadVuexModule}/setTitle`:
        if (mutation.payload !== null) {
          this.title = mutation.payload
        }
        return
      case `${uploadVuexModule}/setStatus`:
        this.handleUploadMutation(mutation.payload)
        return
      case `${listVuexModule}/setStatus`:
        this.titleEditable = mutation.payload === ProcessStatus.Executing ? false : true
        return
      case `${appVuexModule}/setAppReady`:
        this.setAllEditable(true)
        return this.$forceUpdate()
      default:
        return
    }
  }

  @Watch('title')
  private onTitleChanged(newTitle: string, oldTitle: string) {
    const listModule = getModule(ListModule, this.$store)
    const uploadModule = getModule(UploadModule, this.$store)
    const drawerModule = getModule(DrawerModule, this.$store)
    FileMetadataModule.titleDescriptionChanged(newTitle, uploadModule.description, listModule, uploadModule)
    if (listModule.status === ProcessStatus.Ready) {
      this.$root.$emit(OpenDrawer)
      drawerModule.setDrawerState(DrawerState.beforeProcessing)
    }
  }

  @Watch('description')
  private onDescriptionChanged(newDescription: string, oldDescription: string) {
    const listModule = getModule(ListModule, this.$store)
    const uploadModule = getModule(UploadModule, this.$store)
    const drawerModule = getModule(DrawerModule, this.$store)
    FileMetadataModule.titleDescriptionChanged(uploadModule.title, newDescription, listModule, uploadModule)
    if (listModule.status === ProcessStatus.Ready) {
      this.$root.$emit(OpenDrawer)
      drawerModule.setDrawerState(DrawerState.beforeProcessing)
    }
  }

  @Watch('viewOnly')
  private onViewOnlyChanged(newViewOnly: boolean, oldViewOnly: boolean) {
    this.setAllEditable(newViewOnly ? false : true)
  }

  private setAllEditable(editable: boolean) {
    this.otherEditable = editable
    this.titleEditable = editable
  }

  private handleUploadMutation(payload: string|ProcessStatus) {
    switch (payload) {
      case ProcessStatus.NotReady:
      case ProcessStatus.Ready:
      case ProcessStatus.Error:
        return this.setAllEditable(true)
      case ProcessStatus.Executing:
      case ProcessStatus.Complete:
        return this.setAllEditable(false)
      default:
        return
    }
  }
}
</script>
