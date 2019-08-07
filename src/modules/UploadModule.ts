import {
  Module,
  Mutation,
  VuexModule,
  Action} from 'vuex-module-decorators'
import FfaProcessModule from '../interfaces/vuex/FfaProcessModule'
import { ProcessStatus } from '../models/ProcessStatus'
import FileHelper from '../util/FileHelper'
import { Errors } from '../util/Constants'
import { setPublicKey } from '../../src/util/Metamask'
import MetaMaskModule from './MetaMaskModule'
import FlashesModule from './FlashesModule'
import Web3Module from './Web3Module'

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
    const metaMaskModule = this.context.rootState.metaMaskModule as MetaMaskModule
    const flashesModule = this.context.rootState.web3Module as FlashesModule

    // if (ethereum.selectedAddress.length === 0) {
    //   throw new Error(Errors.PUBLIC_KEY_EMPTY)
    // }

    if (typeof ethereum === 'undefined' || typeof ethereum.selectedAddress === 'undefined') {
      setPublicKey(flashesModule, metaMaskModule, web3Module)
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

}
