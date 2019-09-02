import {
  Module,
  Mutation,
  VuexModule} from 'vuex-module-decorators'

import FfaProcessModule from '../interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'
import FfaListing, { FfaListingStatus } from '../models/FfaListing'
import FileHelper from '../util/FileHelper'
import { Errors } from '../util/Constants'
import Web3Module from './Web3Module'

import FileUploaderModule from '../functionModules/components/FileUploaderModule'
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
  public owner: string = ''

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
    const web3Module = this.context.rootState.web3Module as Web3Module

    if (EthereumModule.ethereumDisabled()) {
      throw new Error(Errors.PUBLIC_KEY_EMPTY)
    }

    if (this.title.length === 0) {
      throw new Error(Errors.TITLE_EMPTY)
    }

    if (!web3Module.web3.eth) {
      throw new Error(Errors.WEB3_UNINITIALIZED)
    }

    const hashedAccount = web3Module.web3.utils.keccak256(ethereum.selectedAddress)
    const hashedTitle = web3Module.web3.utils.keccak256(this.title)
    const hash = web3Module.web3.utils.keccak256(`${hashedAccount}${hashedTitle}`)
    const hashPrefix = hash.startsWith('0x') ? '' : '0x'
    return `${hashPrefix}${hash}`
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

  get ffaListing(): FfaListing {
    return new FfaListing(this.title,
                          this.description,
                          this.file.type,
                          this.hash,
                          this.md5,
                          this.tags,
                          this.ffaListingStatus,
                          this.owner)
  }
}
