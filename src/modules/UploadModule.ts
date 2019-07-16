import {
  Module,
  VuexModule,
  Mutation } from 'vuex-module-decorators'
import FfaProcessModule from '../models/FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'
import FileTypeHelper from '../util/FileHelper'
import FileHelper from '../util/FileHelper'

@Module({ namespaced: true, name: 'uploadModule' })
export default class UploadModule extends VuexModule implements FfaProcessModule {

  public currentFile = FileTypeHelper.EmptyFile
  public status: ProcessStatus = ProcessStatus.NotReady
  public percentComplete = 0
  public filename = ''
  public originalFilename = ''
  public title = ''
  public description = ''
  public tags = []
  public hash = ''

  // @MutationAction({mutate: ['flashes']})
  // public async fetchAll() {
  //   const response = [{}] // : Response = await getJSON('https://hasgeek.github.io/events/api/events.json')
  //   return response
  // }

  @Mutation
  public reset() {
    this.currentFile = FileTypeHelper.EmptyFile
    this.status = ProcessStatus.NotReady
    this.percentComplete = 0
    this.filename = ''
    this.description = ''
  }

  @Mutation
  public prepare(file: File) {
    this.currentFile = file
    this.filename = file.name
  }

  @Mutation
  public setFilename(filename: string) {
    this.filename = this.filename
  }

  @Mutation
  public setOriginalFilename(originalFilename: string) {
    this.originalFilename = originalFilename
  }

  @Mutation
  public setTitle(title: string) {
    this.title = title
  }

  @Mutation
  public setHash(hash: string) {
    this.hash = hash
  }

  @Mutation
  public setDescription(description: string) {
    this.description = description
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
    return FileHelper.fileSizeString(this.currentFile.size)
  }

  get mimeType(): string {
    return this.currentFile.type
  }

  get mimeTypeIcon(): string[] {
    if (!this.currentFile.type) {
      return this.mimeTypeIconByExtension()
    }

    return FileHelper.mimeTypeIcon(this.currentFile.type)
  }

  get fileActualName(): string {
    if (this.currentFile === undefined) {
      return ''
    }
    return this.currentFile.name
  }

  private mimeTypeIconByExtension(): string[] {

    const splat = this.currentFile.name.split('.')
    if (splat.length < 2) {
      return FileHelper.FileIcon
    }

    const extension = splat[splat.length - 1].toLowerCase()
    return FileHelper.mimeTypeIconByExtension(extension)
  }
}
