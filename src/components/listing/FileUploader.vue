<template>
    <div class="file-uploader">
      <div class="dropzone">
        <div
          v-show="!isFileAttached"
          class="image" 
          :class="{ 
            'default': !isDraggingOver, 
            'hover': isDraggingOver,
          }">
        </div>
        <FileIcon 
          v-show="isFileAttached" 
          class="file-icon" 
          :fileIconType="mimeTypeIcon" />
        <div class="dz-message">
          <p :class="dropzoneTextClass" v-if="!isDraggingOver"> {{ dropzoneText }}</p>
        </div>
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

import FileIcon from '../ui/FileIcon.vue'

import '@/assets/style/components/file-uploader.sass'
import DatatrustTask from '../../models/DatatrustTask'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'

Dropzone.autoDiscover = false

const vuexModuleName = 'uploadModule'

const dzDragEnter = 'dragenter'
const dzDragLeave = 'dragleave'
const dzAddedFile = 'addedfile'
const dzSending = 'sending'
const dzUploadProgress = 'uploadprogress'
const dzSuccess = 'success'
const dzError = 'error'

const fileParam = 'file'

@Component({
   components: {
    FileIcon,
  },
})
export default class FileUploader extends Vue {
  @NoCache
  private get dropzoneText(): string {
    switch (this.uploadModule.status) {
      case ProcessStatus.NotReady:
        if (this.uploadModule.file.name === FileHelper.EmptyFile.name) {
          return Labels.DROP_A_FILE
        }
      case ProcessStatus.Ready:
        return this.uploadModule.filename
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
  private get mimeTypeIcon(): string {
    switch (this.uploadModule.status) {
      case ProcessStatus.NotReady:
      case ProcessStatus.Ready:
      case ProcessStatus.Executing:
      case ProcessStatus.Complete:
      case ProcessStatus.Error:
        return this.uploadModule.mimeTypeIcon
      default:
        return ''
    }
  }

  @NoCache
  get displayHelpText(): boolean {
    return (this.uploadModule.file === FileHelper.EmptyFile && !this.isDraggingOver)
  }

  @NoCache
  get isFileAttached(): boolean {
    return this.uploadModule.file !== FileHelper.EmptyFile
  }

  @NoCache
  get dropzoneTextClass(): object {
    if (this.uploadModule.file !== FileHelper.EmptyFile) {
      return { 'small-text': true }
    }

    return { 'default-text': true }
  }

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
  private datatrustTaskModule: DatatrustTaskModule = getModule(DatatrustTaskModule, this.$store)

  public mounted(this: FileUploader) {

    this.$store.subscribe(this.vuexSubscriptions)

    if (document.getElementsByClassName(this.dropzoneClass) &&
      !this.dropzone) {
      this.initializeDropzone()
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

        this.enableDropzone()
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
        this.enableDropzone()
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
    // if (!validation.valid) {
    //   // TODO: wire this back into the ui?  these errors should have been caught by now...
    //   return
    // }
    if (this.dropzone) {
      this.dropzone.processQueue()
    }
  }

  private fileAdded(f: DropzoneFile) {
    const j = this.dropzone.files.length
    const i = j - 1
    this.dropzone.files = this.dropzone.files.slice(i, j)
    FileUploaderModule.fileAdded(f, this.uploadModule)
    this.isDraggingOver = false
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

  private succeeded(f: DropzoneFile, resp: object) {
    this.createPollingTask(resp)
    this.uploadModule.setStatus(ProcessStatus.Complete)
  }

  private failed(f: DropzoneFile, errorMessage: string, xhr: XMLHttpRequest) {
    this.uploadModule.setStatus(ProcessStatus.Error)
  }

  private dragEnter() {
    this.isDraggingOver = true
  }

  private dragLeave() {
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

  private createPollingTask(resp: object) {
    const { message: _, task_id: taskId } = (resp as any)

    const listingHash = this.uploadModule.hash
    const datatrustTaskDetail = new DatatrustTaskDetails(
      listingHash,
      FfaDatatrustTaskType.createListing,
    )
    const datatrustTask = new DatatrustTask(taskId, datatrustTaskDetail)

    this.datatrustTaskModule.addTask(datatrustTask)
  }
}
</script>
