import {
  Module,
  Mutation,
  VuexModule} from 'vuex-module-decorators'
import FfaProcessModule from '../interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'
import FileTypeHelper from '../util/FileHelper'
import FileHelper from '../util/FileHelper'

@Module({ namespaced: true, name: 'uploadModule' })
export default class UploadModule extends VuexModule implements FfaProcessModule {

  public file = FileTypeHelper.EmptyFile
  public status = ProcessStatus.NotReady
  public percentComplete = 0
  public filename = ''
  public originalFilename = ''
  public title = ''
  public description = ''
  public tags: string[] = []
  public md5 = ''
  public hash = ''

  // @MutationAction({mutate: ['flashes']})
  // public async fetchAll() {
  //   const response = [{}] // : Response = await getJSON('https://hasgeek.github.io/events/api/events.json')
  //   return response
  // }

  @Mutation
  public reset() {
    this.file = FileTypeHelper.EmptyFile
    this.status = ProcessStatus.NotReady
    this.percentComplete = 0
    this.filename = ''
    this.originalFilename = ''
    this.title = ''
    this.description = ''
    this.tags = []
    this.md5 = ''
    this.hash = ''
  }

  @Mutation
  public prepare(file: File) {
    this.file = file
    this.filename = file.name
  }

  @Mutation
  public setFilename(filename: string) {
    this.filename = filename
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
  public setMd5(md5: string) {
    this.md5 = md5
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
  public addTag(tag: string) {
    this.tags.push(tag)
  }

  @Mutation
  public removeTag(tag: string) {
    this.tags = this.tags.filter((t) => t !== tag)
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

  get hasFile(): boolean {
    return this.file !== FileHelper.EmptyFile
  }

  get fileSizeFormatted(): string {
    return FileHelper.fileSizeString(this.file.size)
  }

  get mimeTypeIcon(): string[] {
    if (!this.file.type) {
      const splat = this.file.name.split('.')
      if (splat.length < 2) {
        return FileHelper.FileIcon
      }

      const extension = splat[splat.length - 1].toLowerCase()
      return FileHelper.mimeTypeIconByExtension(extension)
    }

    return FileHelper.mimeTypeIcon(this.file.type)
  }
}
