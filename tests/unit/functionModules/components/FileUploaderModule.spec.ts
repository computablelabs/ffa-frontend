import { getModule } from 'vuex-module-decorators'
import FileUploaderModule from '../../../../src/functionModules/components/FileUploaderModule'
import UploadModule from '../../../../src/vuexModules/UploadModule'
import MetaMaskModule from '../../../../src/vuexModules/MetaMaskModule'
import appStore from '../../../../src/store'
import Web3Module from '../../../../src/vuexModules/Web3Module'
import FileHelper from '../../../../src/util/FileHelper'
import { ProcessStatus } from '../../../../src/models/ProcessStatus'

import Web3 from 'web3'
import { DropzoneFile } from 'dropzone'

describe('FileUploaderModule.ts', () => {
  const web3 = new Web3('http://localhost:8545/')
  let uploadModule!: UploadModule
  let metaMaskModule!: MetaMaskModule
  let web3Module!: Web3Module

  // Test Parameters
  const titleParam: string = 'testTitle'
  const descriptionParam: string = 'testDescription'
  const filenamesParam: string = 'testFilenames'
  const fileTypeParam: string = 'testfile_type'
  const md5SumParam: string = 'testMd5_sum'
  const tagsParam: string = 'testTags'
  const originalFilenameParam = 'originalFilename'
  const newFilenameParam = 'newFilename'
  const knownFileTypeParam = 'text/plain'
  const emptyFileTypeParam = ''

  beforeAll(() => {
    uploadModule = getModule(UploadModule, appStore)
    metaMaskModule = getModule(MetaMaskModule, appStore)
    web3Module = getModule(Web3Module, appStore)
 })

  describe('preprocessFileData()', () => {
    it('correctly processes form and file data', () => {
      const newForm = new FormData()
      metaMaskModule.setPublicKey('address')
      web3Module.initialize(web3)

      const file = new File(['foo'], 'foo.txt', { type: fileTypeParam })

      uploadModule.prepare(file)
      uploadModule.setTitle(titleParam)
      uploadModule.setDescription(descriptionParam)
      uploadModule.setFilename(filenamesParam)
      uploadModule.setMd5(md5SumParam)
      uploadModule.addTag(tagsParam)

      FileUploaderModule.preprocessFileData(newForm, uploadModule)

      expect(newForm.get('title')).toEqual(titleParam)
      expect(newForm.get('description')).toEqual(descriptionParam)
      expect(newForm.get('md5_sum')).toEqual(md5SumParam)
      expect(newForm.get('tags')).toEqual(tagsParam)
      expect(uploadModule.hash).not.toBeNull()
      expect(uploadModule.file.type).toEqual(fileTypeParam)
    })
  })

  describe('renameFile()', () => {
    it('correctly renames files', () => {
      uploadModule.setTitle('reset')
      uploadModule.setFilename('reset')

      FileUploaderModule.renameFile(originalFilenameParam, newFilenameParam, uploadModule)

      expect(uploadModule.filename).toEqual(newFilenameParam)
      expect(uploadModule.title).toEqual(originalFilenameParam)
    })
  })

  describe('fileAdded()', () => {
    it('correctly sets state', async () => {
      const file = FileHelper.EmptyFile as DropzoneFile
      FileUploaderModule.fileAdded(file, uploadModule)
      expect(uploadModule.status).toEqual(ProcessStatus.NotReady)
      expect(uploadModule.filename).toEqual(FileHelper.EmptyFile.name)
      // a bit janky but we need to wait for the file reader callback
      await delay(1000)
      expect(uploadModule.md5).not.toEqual('')
    })
  })

  describe('handleImproperType()', () => {
    it('correctly hanldes an undefined file type', () => {
      const knownFileTypeResult = FileUploaderModule.handleImproperFileType(knownFileTypeParam)
      const emptyFileTypeResult = FileUploaderModule.handleImproperFileType(emptyFileTypeParam)
      expect(knownFileTypeResult).toEqual(knownFileTypeParam)
      expect(emptyFileTypeResult).toEqual(FileHelper.UnknownType)
    })
  })

  describe('ethereumDisabled()', () => {
    it('correctly tests the global/window ethereum object', () => {
      expect(ethereum.selectedAddress).toEqual('0x123')
      expect(FileUploaderModule.ethereumDisabled()).toBeFalsy()
      ethereum.selectedAddress = ''
      expect(FileUploaderModule.ethereumDisabled()).toBeTruthy()
    })
  })
})

function delay(ms: number): Promise<any> {
  return new Promise( (resolve) => setTimeout(resolve, ms) )
}
