<template>
  <div class="file-uploader">
    <div class="component is-pulled-right">
      <font-awesome-icon
        class="file-bg"
        :icon="['far', 'file']"
        :class="svgColorClass"/>
      <div class="dropzone-text-frame">
        <div class="tile is-vertical is-ancestor">
          <div class="tile is-hcentered dropzone-text is-9">{{ dropzoneText }}</div>
          <div class="tile is-hcentered file-type">
            <font-awesome-icon
              class="file-type-icon"
              :icon="mimeTypeIcon"
              v-if="mimeTypeIcon.length > 0"/>
          </div>
        </div>
      </div>
      <div class="dropzone cover"></div>
    </div>
  </div>
</template>

<script lang="ts">
import Dropzone from 'dropzone'
import { DropzoneFile } from 'dropzone'
import uuid4 from 'uuid/v4'
import SparkMD5, { hashBinary } from 'spark-md5'

import { Component, Vue, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import UploadModule from '../../vuexModules/UploadModule'
import ListModule from '../../vuexModules/ListModule'
import UploadModuleValidator from '../../vuexModules/validators/UploadModuleValidator'
import FfaListing from '../../models/FfaListing'
import { ProcessStatus } from '../../models/ProcessStatus'
import { FileDropped } from '../../models/Events'
import Paths from '../../util/Paths'
import Servers from '../../util/Servers'
import { Errors, Labels, Messages } from '../../util/Constants'
import FileUploaderModule from '../../functionModules/components/FileUploaderModule'

import '@/assets/style/components/file-uploader.sass'

Dropzone.autoDiscover = false

const vuexModuleName = 'uploadModule'

const dzAddedFile = 'addedfile'
const dzSending = 'sending'
const dzUploadProgress = 'uploadprogress'
const dzSuccess = 'success'
const dzError = 'error'

const greenClass = 'green'

const fileParam = 'file'
const titleParam = 'title'
const descriptionParam = 'description'
const filenamesParam = 'filenames'
const fileTypeParam = 'file_type'
const md5SumParam = 'md5_sum'
const tagsParam = 'tags'
const hashParam = 'listing_hash'

@Component
export default class FileUploader extends Vue {

  protected dropzoneClass = 'dropzone'
  protected dropzoneRef = 'dropzone'
  protected dropzone!: Dropzone

  private showUpload = false
  private buttonEnabled = true
  private uploadModule: UploadModule = getModule(UploadModule, this.$store)
  private listModule: ListModule = getModule(ListModule, this.$store)

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
        switch (mutation.payload) {
          case ProcessStatus.Executing:
            this.upload()
            return
          case ProcessStatus.Complete:
          case ProcessStatus.Error:
          default:
            return
        }
      case 'appModule/setAppReady':
        // TODO: experimental. remove later.
        if (!mutation.payload) {
          return
        }
        console.log('FileUploader received appReady')
      default:
        return
    }
  }

  @NoCache
  private get svgColorClass(): string  {
    return this.uploadModule.status === ProcessStatus.Ready ? greenClass : ''
  }

  @NoCache
  private get dropzoneText(): string {

    switch (this.uploadModule.status) {
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
      case ProcessStatus.Ready:
      case ProcessStatus.Executing:
      case ProcessStatus.Complete:
      case ProcessStatus.Error:
        return this.uploadModule.mimeTypeIcon
      default:
        return []
    }
  }

  private initializeDropzone() {
    const dropzoneClass = `.${this.dropzoneClass}`

    this.dropzone = new Dropzone(dropzoneClass, {
      url: `${Servers.Datatrust}${Paths.UploadPath}`,
      paramName: fileParam,
      maxFiles: 1,
      maxFilesize: 50 * 1000 * 1000 * 1000,
      autoProcessQueue: false,
      renameFilename: this.renameFile,
      dictDefaultMessage: '',
    })
    this.dropzone.on(dzAddedFile, this.fileAdded)
    this.dropzone.on(dzSending, this.preprocessFileData)
    this.dropzone.on(dzUploadProgress, this.uploadProgressed)
    this.dropzone.on(dzSuccess, this.succeeded)
    this.dropzone.on(dzError, this.failed)
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

  private renameFile(filename: string): string {
    const newFilename = uuid4()
    FileUploaderModule.renameFile(filename, newFilename, this.uploadModule)
    return uuid4()
  }

  private fileAdded(f: DropzoneFile) {
    const j = this.dropzone.files.length
    const i = j - 1
    this.dropzone.files = this.dropzone.files.slice(i, j)
    FileUploaderModule.fileAdded(f, this.uploadModule)
    this.$root.$emit(FileDropped)
    this.$forceUpdate()
  }

  private fileRemoved(f: File) {
    // do nothing
  }

  private preprocessFileData(f: DropzoneFile, xhr: XMLHttpRequest, formData: FormData) {
    FileUploaderModule.preprocessFileData(formData, this.uploadModule.ffaListing, this.listModule.transactionHash)
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
}
</script>
