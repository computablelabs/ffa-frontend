// import { shallowMount, mount } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import FileUploaderModule from '../../../../src/functionModules/components/FileUploaderModule'
import UploadModule from '../../../../src/modules/UploadModule'
import MetaMaskModule from '../../../../src/modules/MetaMaskModule'
import appStore from '../../../../src/store'
import Web3Module from '../../../../src/modules/Web3Module';
import Web3 from 'web3'

describe('FileUploaderModule.ts', () => {
  const web3 = new Web3('http://localhost:8545/')
  let uploadModule!: UploadModule
  let metaMaskModule!: MetaMaskModule
  let web3Module!: Web3Module

  // Test Parameters
  const titleParam: string = 'title'
  const originalFilenameParam: string = 'originalFilename'
  const descriptionParam: string = 'description'
  const filenamesParam: string = 'filenames'
  const fileTypeParam: string = 'file_type'
  const md5SumParam: string = 'md5_sum'
  const tagsParam: string = 'tags'

  const newFilenameParam = 'newFilename'
  // const hashParam: string = 'listing_hash', expect it to not be null

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
      uploadModule.setOriginalFilename(originalFilenameParam)
      uploadModule.setDescription(descriptionParam)
      uploadModule.setFilename(filenamesParam)
      uploadModule.setMd5(md5SumParam)
      uploadModule.addTag(tagsParam)

      FileUploaderModule.preprocessFileData(newForm, uploadModule)

      expect(newForm.get(titleParam)).toBe(titleParam)
      expect(newForm.get(originalFilenameParam)).toBe(originalFilenameParam)
      expect(newForm.get(descriptionParam)).toBe(descriptionParam)
      expect(newForm.get(md5SumParam)).toBe(md5SumParam)
      expect(newForm.get(tagsParam)).toBe(tagsParam)
      expect(uploadModule.hash).not.toBeNull()
      expect(uploadModule.file.type).toBe(fileTypeParam)
    })
  })

  describe('fileAdded()', () => {
    it('correctly renames files', () => {
      uploadModule.setTitle('reset')
      uploadModule.setFilename('reset')
      uploadModule.setOriginalFilename('reset')

      FileUploaderModule.renameFile(originalFilenameParam, newFilenameParam, uploadModule)

      expect(uploadModule.filename).toBe(newFilenameParam)
      expect(uploadModule.originalFilename).toBe(originalFilenameParam)
      expect(uploadModule.title).toBe(originalFilenameParam)
    })
  })
})
