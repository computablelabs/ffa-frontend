import {
  Module,
  Mutation,
  VuexModule,
  getModule } from 'vuex-module-decorators'
import FfaProcessModule from '../interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'
import FileHelper from '../util/FileHelper'
import MetaMaskModule from './MetaMaskModule'
import { Errors } from '../util/Constants'
import { keccak256 } from 'js-sha3'

@Module({ namespaced: true, name: 'uploadModule' })
export default class UploadModule extends VuexModule implements FfaProcessModule {

  public file = FileHelper.EmptyFile
  public status = ProcessStatus.NotReady
  public percentComplete = 0
  public filename = ''
  public originalFilename = ''
  public title = ''
  public description = ''
  public tags: string[] = []
  public md5 = ''

  // @MutationAction({mutate: ['flashes']})
  // public async fetchAll() {
  //   const response = [{}] // : Response = await getJSON('https://hasgeek.github.io/events/api/events.json')
  //   return response
  // }

  @Mutation
  public reset() {
    this.file = FileHelper.EmptyFile
    this.status = ProcessStatus.NotReady
    this.percentComplete = 0
    this.filename = ''
    this.originalFilename = ''
    this.title = ''
    this.description = ''
    this.tags = []
    this.md5 = ''
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

  get hash(): string {
    const metaMaskModule = this.context.rootState.metaMaskModule as MetaMaskModule
    if (metaMaskModule.publicWalletAddress.length === 0) {
      throw new Error(Errors.ADDRESS_EMPTY)
    }
    if (this.title.length === 0) {
      throw new Error(Errors.TITLE_EMPTY)
    }
    const hashedAccount = keccak256(metaMaskModule.publicWalletAddress)
    const hashedTitle = keccak256(this.title)
    const hash = keccak256(`${hashedAccount}${hashedTitle}`)
    return `0x${hash}`
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
