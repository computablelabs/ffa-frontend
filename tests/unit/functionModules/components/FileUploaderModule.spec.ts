import { getModule } from 'vuex-module-decorators'
import appStore from '../../../../src/store'

import UploadModule from '../../../../src/vuexModules/UploadModule'
import Web3Module from '../../../../src/vuexModules/Web3Module'

import { ProcessStatus } from '../../../../src/models/ProcessStatus'

import FileUploaderModule from '../../../../src/functionModules/components/FileUploaderModule'

import FileHelper from '../../../../src/util/FileHelper'

import Web3 from 'web3'
import { DropzoneFile } from 'dropzone'

describe('FileUploaderModule.ts', () => {
  const web3 = new Web3('http://localhost:8545/')
  let uploadModule!: UploadModule
  let web3Module!: Web3Module

  // Test Parameters
  const titleParam: string = 'testTitle'
  const descriptionParam: string = 'testDescription'
  const filenamesParam: string = 'testFilenames'
  const fileTypeParam: string = 'testfile_type'
  const md5SumParam: string = 'testMd5_sum'
  const tag1Param: string  = 'tag1'
  const tag2Param: string  = 'tag2'
  const hashParam: string = '0xhash'
  const originalFilenameParam = 'originalFilename'
  const newFilenameParam = 'newFilename'
  const knownFileTypeParam = 'text/plain'
  const emptyFileTypeParam = ''
  const transactionHashParam = '0xtransaction'

  beforeAll(() => {
    uploadModule = getModule(UploadModule, appStore)
    web3Module = getModule(Web3Module, appStore)
 })

  describe('preprocessFileData()', () => {
    it('correctly processes form and file data', () => {
      const newForm = new FormData()
      web3Module.initialize(web3)

      const file = new File(['foo'], 'foo.txt', { type: fileTypeParam })

      uploadModule.prepare(file)
      uploadModule.setTitle(titleParam)
      uploadModule.setDescription(descriptionParam)
      uploadModule.setFilename(filenamesParam)
      uploadModule.setMd5(md5SumParam)
      uploadModule.addTag(tag1Param)
      uploadModule.addTag(tag2Param)

      FileUploaderModule.preprocessFileData(newForm, uploadModule.ffaListing, transactionHashParam)

      expect(newForm.get('title')).toEqual(titleParam)
      expect(newForm.get('description')).toEqual(descriptionParam)
      expect(newForm.get('file_type')).toEqual(fileTypeParam)
      expect(newForm.get('md5_sum')).toEqual(md5SumParam)
      expect(newForm.get('tags')).toEqual(`${tag1Param},${tag2Param}`)
      expect(newForm.get('listing_hash')!.toString().length).toBeGreaterThan(0)
      expect(newForm.get('listing_hash')!.toString().startsWith('0x')).toBeTruthy()
      expect(newForm.get('tx_hash')).toEqual(transactionHashParam)
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
      expect(uploadModule.title).toEqual(FileHelper.EmptyFile.name)
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
})

function delay(ms: number): Promise<any> {
  return new Promise( (resolve) => setTimeout(resolve, ms) )
}
