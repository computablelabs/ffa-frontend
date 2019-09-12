<template>
  <div class="file-metadata">
    <form>
      <header>
        <span data-size="size"> Dataset Size: {{this.fileSize}} </span>
        <span> License: {{this.license}} </span>
      </header>
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
import NewListingModule from '../../vuexModules/NewListingModule'
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
const listVuexModule = 'newListingModule'
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

  @Prop()
  public viewOnly!: boolean

  public taggerKey = Keys.FILE_METADATA_KEY
  public purchaseCount: number = 0

  private newListingModule = getModule(NewListingModule, this.$store)
  private uploadModule = getModule(UploadModule, this.$store)
  private drawerModule = getModule(DrawerModule, this.$store)

  private title = ''
  private titleFieldClasses = ['title-input']
  private titlePlaceholder = Placeholders.TITLE
  private titleEditable = true

  private description = ''
  private descriptionPlaceholder = Placeholders.DESCRIPTION

  private otherEditable = true

  private license = 'MIT'
  private fileSize = 0
  private shareDate: number = 0


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
    this.uploadModule.setTitle(newTitle)
    // TODO: recompute and update the module's hash
    this.title = this.uploadModule.title
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case `${uploadVuexModule}/setTitle`:
        if (mutation.payload !== null) {
          this.title = mutation.payload
        }
        return
      case `${uploadVuexModule}/setSize`:
        if (mutation.payload !== null) {
          this.fileSize = mutation.payload
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
    FileMetadataModule.titleDescriptionChanged(newTitle,
                                               this.uploadModule.description,
                                               this.newListingModule,
                                               this.uploadModule)
    if (this.newListingModule.status === ProcessStatus.Ready) {
      this.$root.$emit(OpenDrawer)
      this.drawerModule.setDrawerState(DrawerState.beforeProcessing)
    }
  }

  @Watch('description')
  private onDescriptionChanged(newDescription: string, oldDescription: string) {
    FileMetadataModule.titleDescriptionChanged(this.uploadModule.title,
                                               newDescription,
                                               this.newListingModule,
                                               this.uploadModule)
    if (this.newListingModule.status === ProcessStatus.Ready) {
      this.$root.$emit(OpenDrawer)
      this.drawerModule.setDrawerState(DrawerState.beforeProcessing)
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
