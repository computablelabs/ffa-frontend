import {
  Module,
  Mutation,
  VuexModule} from 'vuex-module-decorators'

import AppModule from '../vuexModules/AppModule'
import FfaProcessModule from '../interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'
import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import FileHelper from '../util/FileHelper'
import { Errors } from '../util/Constants'

import EthereumModule from '../functionModules/ethereum/EthereumModule'

@Module({ namespaced: true, name: 'uploadModule' })
export default class UploadModule extends VuexModule implements FfaProcessModule {

  public file = FileHelper.EmptyFile
  public status = ProcessStatus.NotReady
  public percentComplete = 0
  public filename = ''
  public title = ''
  public description = ''
  public tags: string[] = []
  public md5 = ''
  public ffaListingStatus = FfaListingStatus.new
  public owner = ''
  public license = ''
  public size = 0
  public shareDate = 0
  public purchaseCount = 0
  public datatrustTaskId = ''
  public datatrustStatus = ProcessStatus.NotReady

  @Mutation
  public reset() {
    this.file = FileHelper.EmptyFile
    this.status = ProcessStatus.NotReady
    this.percentComplete = 0
    this.filename = ''
    this.title = ''
    this.description = ''
    this.tags = []
    this.md5 = ''
    this.ffaListingStatus = FfaListingStatus.new
    this.owner = ''
    this.license = ''
    this.datatrustTaskId = ''
    this.datatrustStatus = ProcessStatus.NotReady
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
  public setTags(tags: string[]) {
    this.tags = tags
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

  @Mutation
  public setFfaListingStatus(ffaListingStatus: FfaListingStatus) {
    this.ffaListingStatus = ffaListingStatus
  }

  @Mutation
  public setOwner(owner: string) {
    this.owner = owner
  }

  @Mutation
  public setLicense(license: string) {
    this.license = license
  }

  @Mutation
  public setSize(size: number) {
    this.size = size
  }

  // TODO: remove if unused
  @Mutation
  public setShareDate(shareDate: number) {
    this.shareDate = shareDate
  }

  // TODO: remove if unused
  @Mutation
  public setPurchaseCount(purchaseCount: number) {
    this.purchaseCount = purchaseCount
  }

  @Mutation
  public setDatatrustTaskId(datatrustTaskId: string) {
    this.datatrustTaskId = datatrustTaskId
    this.datatrustStatus = ProcessStatus.Executing
  }

  @Mutation
  public setDatatrustStatus(datatrustStatus: ProcessStatus) {
    this.datatrustStatus = datatrustStatus
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
    const appModule = this.context.rootState.appModule as AppModule

    if (EthereumModule.ethereumDisabled()) {
      throw new Error(Errors.PUBLIC_KEY_EMPTY)
    }

    if (this.title.length === 0) {
      // Note: throwing is more correct
      // but it effs up Vue Dev Tools
      // so we'll return an empty string for now:
      return ''
      // throw new Error(Errors.TITLE_EMPTY)
    }

    if (!appModule.web3.eth) {
      throw new Error(Errors.WEB3_UNINITIALIZED)
    }

    const hashedAccount = appModule.web3.utils.keccak256(ethereum.selectedAddress)
    const hashedTitle = appModule.web3.utils.keccak256(this.title)
    const hash = appModule.web3.utils.keccak256(`${hashedAccount}${hashedTitle}`)

    return hash.startsWith('0x') ? hash : `0x${hash}`
  }

  get mimeTypeIcon(): string {
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

  get ffaListing(): FfaListing {
    return new FfaListing(
      this.title,
      this.description,
      this.file.type,
      this.hash,
      this.md5,
      this.license,
      this.size,
      this.owner,
      this.tags,
      this.ffaListingStatus,
      this.shareDate,
      this.purchaseCount)
  }
}
