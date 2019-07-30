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
import { Component, Vue, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import UploadModule from '../../modules/UploadModule'
import UploadModuleValidator from '../../modules/validators/UploadModuleValidator'
import ListModule from '../../modules/ListModule'
import FfaListing from '../../models/FfaListing'
import { ProcessStatus } from '../../models/ProcessStatus'
import { FileDropped } from '../../models/Events'
import Paths from '../../util/Paths'
import { Errors, Labels, Messages } from '../../util/Constants'
import Dropzone from 'dropzone'
import { DropzoneFile } from 'dropzone'
import uuid4 from 'uuid/v4'
import SparkMD5, { hashBinary } from 'spark-md5'


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
const originalFilenameParam = 'originalFilename'
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

  public mounted(this: FileUploader) {

    this.$store.subscribe(this.vuexSubscriptions)

    if (document.getElementsByClassName(this.dropzoneClass) &&
      !this.dropzone) {
      this.initializeDropzone()
    }
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case `${vuexModuleName}/prepare`:
        break
      case `${vuexModuleName}/setStatus`: {
        switch (mutation.payload) {
          case ProcessStatus.Executing:
            this.upload()
            break
          case ProcessStatus.Complete:
          case ProcessStatus.Error:
          default:
            // nada
            break
        }
      }
      default: {
        // do nothing
      }
    }
  }

  @NoCache
  private get svgColorClass(): string  {
    const uploadModule = getModule(UploadModule, this.$store)
    return uploadModule.status === ProcessStatus.Ready ? greenClass : ''
  }

  @NoCache
  private get dropzoneText(): string {
    const uploadModule = getModule(UploadModule, this.$store)

    switch (uploadModule.status) {
      case ProcessStatus.Ready: {
        return `${uploadModule.fileSizeFormatted}`
      }
      case ProcessStatus.Executing: {
        return `${Messages.UPLOADING}`
      }
      case ProcessStatus.Complete: {
        return `${uploadModule.fileSizeFormatted} ${Messages.UPLOADED}`
      }
      case ProcessStatus.Error: {
        return Errors.UPLOAD_FAILED
      }
      default: {
        return Labels.DROP_A_FILE
      }
    }
  }

  @NoCache
  private get mimeType(): string {
    const uploadModule = getModule(UploadModule, this.$store)
    switch (uploadModule.status) {
      case ProcessStatus.Ready:
      case ProcessStatus.Executing:
      case ProcessStatus.Complete:
      case ProcessStatus.Error: {
        return uploadModule.file.type
      }
      default: {
        return ''
      }
    }
  }

  @NoCache
  private get mimeTypeIcon(): string[] {
    const uploadModule = getModule(UploadModule, this.$store)
    switch (uploadModule.status) {
      case ProcessStatus.Ready:
      case ProcessStatus.Executing:
      case ProcessStatus.Complete:
      case ProcessStatus.Error: {
        return uploadModule.mimeTypeIcon
      }
      default: {
        return []
      }
    }
  }

  private initializeDropzone() {
      const dropzoneClass = `.${this.dropzoneClass}`

      this.dropzone = new Dropzone(dropzoneClass, {
        url: Paths.UploadPath,
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
    const uploadModule = getModule(UploadModule, this.$store)
    const validator = new UploadModuleValidator(uploadModule, this.$store)
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
    const uploadModule = getModule(UploadModule, this.$store)
    const newFilename = uuid4()
    uploadModule.setFilename(newFilename)
    uploadModule.setOriginalFilename(filename)
    return uuid4()
  }

  private fileAdded(f: DropzoneFile) {
    const j = this.dropzone.files.length
    const i = j - 1
    this.dropzone.files = this.dropzone.files.slice(i, j)
    const uploadModule = getModule(UploadModule, this.$store)
    uploadModule.reset()
    // TODO: prolly need to check for accepted file types
    uploadModule.prepare(f)
    // currently we need to manually promote the state
    uploadModule.setStatus(ProcessStatus.Ready)

    // TODO: pull out for testing
    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(f)
    fileReader.onloadend = () => {
      const result = fileReader.result! as ArrayBuffer
      uploadModule.setMd5(SparkMD5.ArrayBuffer.hash(result))
    }
    this.$root.$emit(FileDropped)
    this.$forceUpdate()
  }

  private fileRemoved(f: File) {
    // do nothing
  }

  private preprocessFileData(f: DropzoneFile, xhr: XMLHttpRequest, formData: FormData) {
    const uploadModule = getModule(UploadModule, this.$store)
    formData.append(originalFilenameParam, uploadModule.originalFilename)
    formData.append(titleParam, uploadModule.title)
    formData.append(descriptionParam, uploadModule.description)
    formData.append(filenamesParam, uploadModule.file.name)
    formData.append(fileTypeParam, uploadModule.file.type)
    formData.append(md5SumParam, uploadModule.md5)
    formData.append(tagsParam, uploadModule.tags.join())
    formData.append(hashParam, uploadModule.hash)
  }

  private uploadProgressed(f: DropzoneFile, percent: number, bytes: number) {
    const uploadModule = getModule(UploadModule, this.$store)
    uploadModule.setPercentComplete(percent)
  }

  private succeeded(f: DropzoneFile, resp: string) {
    const uploadModule = getModule(UploadModule, this.$store)
    const listModule = getModule(ListModule, this.$store)
    uploadModule.setStatus(ProcessStatus.Complete)
    const ffaListing = new FfaListing(
                          uploadModule.title,
                          uploadModule.description,
                          uploadModule.file.type,
                          uploadModule.hash,
                          uploadModule.md5,
                          uploadModule.tags)
    listModule.prepare(ffaListing)
    listModule.setStatus(ProcessStatus.Ready)
  }

  private failed(f: DropzoneFile, errorMessage: string, xhr: XMLHttpRequest) {
    const uploadModule = getModule(UploadModule, this.$store)
    uploadModule.setStatus(ProcessStatus.Error)
  }
}
</script>