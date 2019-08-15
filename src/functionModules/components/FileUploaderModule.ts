import { DropzoneFile } from 'dropzone'
import SparkMD5 from 'spark-md5'

import UploadModule from '../../vuexModules/UploadModule'

import FileHelper from '../../util/FileHelper'

const titleParam = 'title'
const descriptionParam = 'description'
const filenamesParam = 'filenames'
const fileTypeParam = 'file_type'
const md5SumParam = 'md5_sum'
const tagsParam = 'tags'
const hashParam = 'listing_hash'
const licenseParam = 'license'
const license = 'MIT'

export default class FileUploaderModule {
  public static preprocessFileData(formData: FormData, uploadModule: UploadModule)  {
    formData.append(titleParam, uploadModule.title)
    formData.append(descriptionParam, uploadModule.description)
    formData.append(filenamesParam, uploadModule.file.name)
    formData.append(fileTypeParam, this.handleImproperFileType(uploadModule.file.type))
    formData.append(md5SumParam, uploadModule.md5)
    formData.append(tagsParam, uploadModule.tags.join())
    formData.append(hashParam, uploadModule.hash)
    formData.append(licenseParam, license)
  }

  public static renameFile(filename: string, newFilename: string, uploadModule: UploadModule) {
    // const uploadModule = getModule(UploadModule, store)
    uploadModule.setFilename(newFilename)
    uploadModule.setTitle(filename)
  }

  public static fileAdded(f: DropzoneFile, uploadModule: UploadModule) {

    // const uploadModule = getModule(UploadModule, store)
    uploadModule.reset()
    // TODO: prolly need to check for accepted file types
    uploadModule.prepare(f)

    // we no longer alter state here
    // see FileMetadata::titleChanged()

    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(f)
    fileReader.onloadend = () => {
      const result = fileReader.result! as ArrayBuffer
      uploadModule.setMd5(SparkMD5.ArrayBuffer.hash(result))
    }
  }

  public static handleImproperFileType(fileType: string): string {
    return (fileType === '') ? FileHelper.UnknownType : fileType
  }

  public static ethereumDisabled(): boolean {
    return typeof ethereum === 'undefined' ||
      ethereum === null ||
      typeof ethereum.selectedAddress === 'undefined' ||
      ethereum.selectedAddress === null ||
      typeof ethereum.selectedAddress !== 'string' ||
      ethereum.selectedAddress.length <= 0
  }
}
