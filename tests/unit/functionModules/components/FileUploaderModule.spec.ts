import { getModule } from 'vuex-module-decorators'
import FileUploaderModule from '../../../../src/functionModules/components/FileUploaderModule'
import UploadModule from '../../../../src/modules/UploadModule'
import MetaMaskModule from '../../../../src/modules/MetaMaskModule'
import appStore from '../../../../src/store'
import Web3Module from '../../../../src/modules/Web3Module'
import Web3 from 'web3'


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

  describe('fileAdded()', () => {
    it('correctly renames files', () => {
      uploadModule.setTitle('reset')
      uploadModule.setFilename('reset')

      FileUploaderModule.renameFile(originalFilenameParam, newFilenameParam, uploadModule)

      expect(uploadModule.filename).toEqual(newFilenameParam)
      expect(uploadModule.title).toEqual(originalFilenameParam)
    })
  })

})
