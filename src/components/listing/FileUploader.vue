<template>
  <div class="file-uploader">
    <div class="full-browser-overlay dropzone" />
    <div class="image">
      <img 
        v-if="!isDraggingOver" 
        src="@/assets/image/icon/file/large/file-upload-dropzone.svg" />
      <img 
        v-if="isDraggingOver" 
        src="@/assets/image/icon/file/large/file-upload-dropzone-hover.svg" />
    </div>

    <div class="text">
      <p>{{ dropzoneText }}</p>
      <p>Learn more about listing</p>
    </div>
   
  </div>
</template>

<script lang="ts">
import Dropzone from 'dropzone'
import { DropzoneFile } from 'dropzone'
import uuid4 from 'uuid/v4'
import SparkMD5, { hashBinary } from 'spark-md5'

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import UploadModule from '../../vuexModules/UploadModule'
import NewListingModule from '../../vuexModules/NewListingModule'
import UploadModuleValidator from '../../vuexModules/validators/UploadModuleValidator'

import FileUploaderModule from '../../functionModules/components/FileUploaderModule'

import FfaListing from '../../models/FfaListing'
import { ProcessStatus } from '../../models/ProcessStatus'
// import { FileDropped } from '../../models/Events'

import Paths from '../../util/Paths'
import Servers from '../../util/Servers'
import FileHelper from '../../util/FileHelper'
import { Errors, Labels, Messages } from '../../util/Constants'

import '@/assets/style/components/file-uploader.sass'

Dropzone.autoDiscover = false

const vuexModuleName = 'uploadModule'

const dzDragEnter = 'dragenter'
const dzDragLeave = 'dragleave'
const dzAddedFile = 'addedfile'
const dzSending = 'sending'
const dzUploadProgress = 'uploadprogress'
const dzSuccess = 'success'
const dzError = 'error'

const greenClass = 'green'
const greyClass = 'grey'

const fileParam = 'file'

@Component
export default class FileUploader extends Vue {
  @NoCache
  private get svgColorClass(): string  {
    switch (this.uploadModule.status) {
      case ProcessStatus.Ready:
        return greenClass
      case ProcessStatus.Executing:
        return greyClass
      default:
        return this.clickDisabled ? greyClass : ''
    }
  }

  @NoCache
  private get dropzoneText(): string {
    switch (this.uploadModule.status) {
      case ProcessStatus.NotReady:
        if (this.uploadModule.file.name === FileHelper.EmptyFile.name) {
          return Labels.DROP_A_FILE
        }
      case ProcessStatus.Ready:
        return this.uploadModule.fileSizeFormatted
      case ProcessStatus.Executing:
        return Messages.UPLOADING
      case ProcessStatus.Complete:
        return `${this.uploadModule.fileSizeFormatted} ${Messages.UPLOADED}`
      case ProcessStatus.Error:
        return Errors.UPLOAD_FAILED
      default:
        return Labels.DROP_A_FILE
    }
  }

  @NoCache
  private get mimeType(): string {
    switch (this.uploadModule.status) {
      case ProcessStatus.NotReady:
      case ProcessStatus.Ready:
      case ProcessStatus.Executing:
      case ProcessStatus.Complete:
      case ProcessStatus.Error:
        return this.uploadModule.file.type
      default:
        return ''
    }
  }

  @NoCache
  private get mimeTypeIcon(): string[] {
    switch (this.uploadModule.status) {
      case ProcessStatus.NotReady:
      case ProcessStatus.Ready:
      case ProcessStatus.Executing:
      case ProcessStatus.Complete:
      case ProcessStatus.Error:
        return this.uploadModule.mimeTypeIcon
      default:
        return []
    }
  }

  get isViewOnly(): boolean {
    return !!this.viewOnly
  }

  @Prop()
  public viewOnly!: boolean

  protected dropzoneClass = 'dropzone'
  protected dropzoneRef = 'dropzone'
  protected dropzone!: Dropzone

  // render different when file is being dragged over the dropzone
  protected isDraggingOver = false

  private clickDisabled: boolean = false
  private showUpload = false
  private buttonEnabled = true
  private uploadModule: UploadModule = getModule(UploadModule, this.$store)
  private newListingModule: NewListingModule = getModule(NewListingModule, this.$store)

  public mounted(this: FileUploader) {

    this.$store.subscribe(this.vuexSubscriptions)

    if (document.getElementsByClassName(this.dropzoneClass) &&
      !this.dropzone) {
      this.initializeDropzone()
    }

    if (this.isViewOnly) {
      this.disableDropzone()
      return
    }

    console.log('FileUploader mounted')
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case `${vuexModuleName}/prepare`:
        return
      case `${vuexModuleName}/setStatus`:
        this.handleUploadModuleSetStatus(mutation.payload)
        return
      case 'appModule/setAppReady':
        // TODO: experimental. remove later.
        if (!mutation.payload) {
          return
        }
        if (!this.isViewOnly) {
          this.enableDropzone()
        }
        console.log('FileUploader received setAppReady')
        this.$forceUpdate()
      default:
        return
    }
  }

  private handleUploadModuleSetStatus(mutationPayload: string|ProcessStatus) {
    switch (mutationPayload) {
      case ProcessStatus.Executing:
        this.upload()
        return
      case ProcessStatus.Complete:
        if (!this.isViewOnly) {
          this.enableDropzone()
        }
      case ProcessStatus.Error:
      default:
        return
    }
  }

  private initializeDropzone() {
    const dropzoneClass = `.${this.dropzoneClass}`
    const url = `${Servers.Datatrust}${Paths.UploadPath}`

    this.dropzone = new Dropzone(dropzoneClass, {
      url,
      paramName: fileParam,
      maxFiles: 1,
      maxFilesize: 50 * 1000 * 1000 * 1000,
      autoProcessQueue: false,
      dictDefaultMessage: '',
    })
    this.dropzone.on(dzAddedFile, this.fileAdded)
    this.dropzone.on(dzSending, this.preprocessFileData)
    this.dropzone.on(dzUploadProgress, this.uploadProgressed)
    this.dropzone.on(dzSuccess, this.succeeded)
    this.dropzone.on(dzError, this.failed)
    this.dropzone.on(dzDragEnter, this.dragEnter)
    this.dropzone.on(dzDragLeave, this.dragLeave)
  }

  private upload() {
    const validator = new UploadModuleValidator(this.uploadModule, this.$store)
    const validation = validator.validate()
    if (!validation.valid) {
      // TODO: wire this back into the ui?  these errors should have been caught by now...
      return
    }
    if (this.dropzone) {
      this.dropzone.processQueue()
    }
  }

  private fileAdded(f: DropzoneFile) {
    const j = this.dropzone.files.length
    const i = j - 1
    this.dropzone.files = this.dropzone.files.slice(i, j)
    FileUploaderModule.fileAdded(f, this.uploadModule)
    this.$forceUpdate()
  }

  private fileRemoved(f: File) {
    // do nothing
  }

  private preprocessFileData(f: DropzoneFile, xhr: XMLHttpRequest, formData: FormData) {
    FileUploaderModule.preprocessFileData(
      f,
      formData,
      this.uploadModule.ffaListing,
      this.newListingModule.transactionHash)
  }

  private uploadProgressed(f: DropzoneFile, percent: number, bytes: number) {
    this.uploadModule.setPercentComplete(percent)
  }

  private succeeded(f: DropzoneFile, resp: string) {
    this.uploadModule.setStatus(ProcessStatus.Complete)
  }

  private failed(f: DropzoneFile, errorMessage: string, xhr: XMLHttpRequest) {
    this.uploadModule.setStatus(ProcessStatus.Error)
  }

  private dragEnter() {
    console.log("drag enter")
    this.isDraggingOver = true
  }

  private dragLeave() {
    console.log("drag leave")
    this.isDraggingOver = false
  }

  private disableDropzone() {
    this.dropzone.disable()
    this.clickDisabled = true
  }

  private enableDropzone() {
    this.dropzone.enable()
    this.clickDisabled = false
  }

  @Watch('viewOnly')
  private onViewOnlyChanged(newViewOnly: boolean, oldViewOnly: boolean) {
    newViewOnly ? this.disableDropzone() : this.enableDropzone()
  }
}
</script>
