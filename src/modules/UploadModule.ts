
import {
  Module,
  VuexModule,
  Mutation } from 'vuex-module-decorators'
import FfaProcessModule from '../models/FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'

const emptyBlob = new Array<Blob>()
const emptyFile = new File(emptyBlob, 'Empty.zip', { type: 'application/zip' })

const fileIcon = ['far', 'file']
const videoIcon = ['fas', 'video']
const audioIcon = ['fas', 'headphones-alt']
const imageIcon = ['fas', 'camera-retro']
const archiveIcon = ['far', 'file-archive']
const pdfIcon = ['far', 'file-pdf']

const imageApplication = 'image'
const audioApplication = 'audio'
const videoApplication = 'video'
const appApplication = 'application'
const sevenZFormat = 'x-7z-compressed'
const rarFormat = 'x-rar-compressed'
const tarFormat = 'x-tar'
const freeArcFormat = 'x-freearc'
const bzipFormat = 'x-bzip'
const bzip2Format = 'x-bzip2'
const jarFormat = 'java-archive'
const zipFormat = 'zip'
const pdfFormat = 'pdf'
const gifExt = 'gif'
const jpegExt = 'jpeg'
const jpgExt = 'jpg'
const svgExt = 'svg'
const tiffExt = 'tiff'
const mp4Ext = 'mp4'
const m4vExt = 'm4v'
const aviExt = 'avi'
const qtExt = 'qt'
const mkvExt = 'mkv'
const mp3Ext = 'mp3'
const wavExt = 'wav'
const aiffExt = 'aiff'
const oggExt = 'ogg'
const sevenZExt = '7z'
const zipExt = 'zip'
const rarExt = 'rar'
const tarExt = 'tar'
const jarExt = 'jar'
const gzExt = 'gz'
const gzipExt = 'gzip'
const bzipExt = 'bzip'
const bzip2Ext = 'bzip2'
const bz2Ext = 'bz2'
const pdfExt = 'pdf'

@Module({ namespaced: true, name: 'uploadModule' })
export default class UploadModule extends VuexModule implements FfaProcessModule {

  public currentFile = emptyFile
  public status: ProcessStatus = ProcessStatus.NotReady
  public percentComplete = 0
  public fileName = ''
  public fileDescription = ''
  public hash = ''

  // @MutationAction({mutate: ['flashes']})
  // public async fetchAll() {
  //   const response = [{}] // : Response = await getJSON('https://hasgeek.github.io/events/api/events.json')
  //   return response
  // }

  @Mutation
  public reset() {
    this.currentFile = emptyFile
    this.status = ProcessStatus.NotReady
    this.percentComplete = 0
    this.fileName = ''
    this.fileDescription = ''
  }

  @Mutation
  public prepare(file: File) {
    this.currentFile = file
    this.fileName = file.name
  }

  @Mutation
  public setFileName(fileName: string) {
    this.fileName = this.fileName
  }

  @Mutation
  public setHash(hash: string) {
    this.hash = hash
  }

  @Mutation
  public setFileDescription(fileDescription: string) {
    this.fileDescription = this.fileDescription
  }

  @Mutation
  public setPercentComplete(percentComplete: number) {
    this.percentComplete = percentComplete
  }

  @Mutation
  public setStatus(status: ProcessStatus) {
    this.status = status
  }

  @Mutation
  public nextStatus() {
    if (this.status === ProcessStatus.Error) {
      return
    }
    const currentStatusIndex = Number(this.status)
    const nextStatus = ProcessStatus[currentStatusIndex + 1] as keyof typeof ProcessStatus
    this.status = ProcessStatus[nextStatus]
  }

  get namespace(): string {
    return 'uploadModule'
  }

  get processStatus(): ProcessStatus {
    return this.status
  }

  get hasFile(): boolean {
    return this.currentFile !== undefined && this.currentFile !== null
  }

  get fileSize(): number {
    if (this.currentFile === undefined) {
      return 0
    }
    return this.currentFile.size
  }

  get fileSizeFormatted(): string {
    const KB = 1000
    const MB = 1000 * KB
    const GB = 1000 * MB

    const fileSize = this.currentFile.size
    if (Math.floor(fileSize / GB) > 0) {
      return `${(fileSize / GB).toFixed(1)} GB`
    }
    if (Math.floor(fileSize / MB) > 0) {
      return `${(fileSize / MB).toFixed(1)} MB`
    }
    if (Math.floor(fileSize / KB) > 0) {
      return `${(fileSize / KB).toFixed(0)} KB`
    }
    return `${fileSize} bytes`
  }

  get mimeType(): string {
    return this.currentFile.type
  }

  get mimeTypeIcon(): string[] {
    if (!this.currentFile.type) {
      return this.mimeTypeIconByExtension
    }

    const splat = this.currentFile.type.split('/')
    if (splat.length < 2) {
      return fileIcon
    }

    const type = splat[0]
    const format = splat[1]

    switch (type) {
      case imageApplication:
        return imageIcon
      case videoApplication:
        return videoIcon
      case audioApplication:
        return audioIcon
      case appApplication: {
        switch (format) {
          case sevenZFormat:
          case rarFormat:
          case tarFormat:
          case freeArcFormat:
          case bzipFormat:
          case bzip2Format:
          case jarFormat:
          case zipFormat:
            return archiveIcon
          case pdfFormat:
            return pdfIcon
          default:
            return fileIcon
        }
      }
      default:
        return fileIcon
    }
  }

  get fileActualName(): string {
    if (this.currentFile === undefined) {
      return ''
    }
    return this.currentFile.name
  }

  get mimeTypeIconByExtension(): string[] {

    const splat = this.currentFile.name.split('.')
    if (splat.length < 2) {
      return fileIcon
    }

    const extension = splat[splat.length - 1].toLowerCase()

    switch (extension) {
      case gifExt:
      case jpegExt:
      case jpgExt:
      case svgExt:
      case tiffExt:
        return imageIcon
      case mp4Ext:
      case m4vExt:
      case aviExt:
      case qtExt:
      case mkvExt:
        return videoIcon
      case mp3Ext:
      case wavExt:
      case aiffExt:
      case oggExt:
        return audioIcon
      case sevenZExt:
      case zipExt:
      case rarExt:
      case tarExt:
      case jarExt:
      case gzExt:
      case gzipExt:
      case bzipExt:
      case bzip2Ext:
      case bz2Ext:
        return archiveIcon
      case pdfExt:
        return pdfIcon
      default:
        return fileIcon
    }
  }
}
