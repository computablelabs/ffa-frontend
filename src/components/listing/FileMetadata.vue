<template>
  <div class="file-metadata">
    <div class="form-container">
      <form>
        <text-field
          class="title-field"
          shouldSelectOnFocus=true
          showLabel=false
          :placeholder="titlePlaceholder"
          :editable="titleEditable"
          :value="title"
          :validator="validateTitle"
          :onChange="onTitleChange" />

        <div class="field">
          <div class="control">
            <textarea
              class="textarea description-field"
              type="text"
              v-model="description"
              :disabled="!otherEditable"
              :placeholder="descriptionPlaceholder">
            </textarea>
          </div>
        </div>
      </form>
    </div>
    <div class="bullet-row">
      <div class="bullet-item price">
        {{ costETH }}
      </div>
      <div class="bullet-item size">
        {{ fileSizeString }}
      </div>
    </div>
    <div class="bullet-item license">
      <span :data-license="license">
        <a :href="licenseURL" target="_blank">{{ license }}</a>
      </span>
    </div>
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
import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'

import { ProcessStatus } from '../../models/ProcessStatus'

import FileMetadataModule from '../../functionModules/components/FileMetadataModule'

import TextField from '@/components/ui/TextField.vue'

import { Placeholders, Keys, License } from '../../util/Constants'
import FileHelper from '../../util/FileHelper'

import '@/assets/style/components/file-metadata.sass'

@Component({
  components: {
    TextField,
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
  private appModule = getModule(AppModule, this.$store)

  private title = ''
  private titlePlaceholder = Placeholders.TITLE
  private titleEditable = true

  private description = ''
  private descriptionPlaceholder = Placeholders.DESCRIPTION

  private otherEditable = true

  private license = License.name
  private licenseURL = License.url
  private fileSize = 0
  private shareDate: number = 0

  private unsubscribe!: () => void

  public created(this: FileMetadata) {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
    this.setAllEditable(false)
    if (!this.isViewOnly) {
      this.setAllEditable(true)
    }
    this.setOwner()
    console.log('FileMetadata mounted')
  }

  public beforeDestroy() {
    this.unsubscribe()
  }

  public setOwner() {
    if (!!ethereum && !!ethereum.selectedAddress) {
      this.uploadModule.setOwner(ethereum.selectedAddress)
    }
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

  public onDescriptionChange(newDescription: string) {
    this.uploadModule.setDescription(newDescription)
    this.description = this.uploadModule.description
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case 'uploadModule/setTitle':
        if (mutation.payload !== null) {
          this.title = mutation.payload
        }
        return
      case 'uploadModule/setSize':
        if (mutation.payload !== null) {
          this.fileSize = mutation.payload
        }
        return
      case 'uploadModule/setStatus':
        this.handleUploadMutation(mutation.payload)
        return
      case 'newListingModule/setStatus':
        this.titleEditable = mutation.payload === ProcessStatus.Executing ? false : true
        return
      case 'appModule/setAppReady':
        this.setAllEditable(true)
        return this.$forceUpdate()
      default:
        return
    }
  }

  private get fileSizeString(): string {
    return FileHelper.fileSizeString(this.fileSize)
  }

  public get costETH(): string {
    return FileHelper.costString(this.fileSize, this.appModule.costPerByte)
  }

  @Watch('title')
  private onTitleChanged(newTitle: string, oldTitle: string) {
    FileMetadataModule.titleDescriptionChanged(
      newTitle,
      this.uploadModule.description,
      this.$store)

    if (this.newListingModule.status === ProcessStatus.Ready) {
      this.drawerModule.setDrawerState(DrawerState.beforeProcessing)
    }
  }

  @Watch('description')
  private onDescriptionChanged(newDescription: string, oldDescription: string) {
    FileMetadataModule.titleDescriptionChanged(this.uploadModule.title,
                                               newDescription,
                                               this.$store)
    if (this.newListingModule.status === ProcessStatus.Ready) {
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
