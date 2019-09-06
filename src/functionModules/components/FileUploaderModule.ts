import { DropzoneFile } from 'dropzone'
import SparkMD5 from 'spark-md5'

import UploadModule from '../../vuexModules/UploadModule'
import FfaListing from 'models/FfaListing'
import FileHelper from '../../util/FileHelper'

const titleParam = 'title'
const descriptionParam = 'description'
const fileTypeParam = 'file_type'
const md5SumParam = 'md5_sum'
const tagsParam = 'tags'
const hashParam = 'listing_hash'
const licenseParam = 'license'
const license = 'MIT'
const transactionHashParam = 'tx_hash'
const size = 'size'

export default class FileUploaderModule {

  public static preprocessFileData(formData: FormData, ffaListing: FfaListing, transactionHash: string)  {
    formData.append(titleParam, ffaListing.title)
    formData.append(descriptionParam, ffaListing.description)
    formData.append(fileTypeParam, this.handleImproperFileType(ffaListing.type))
    formData.append(md5SumParam, ffaListing.md5)
    formData.append(tagsParam, ffaListing.tags.join())
    formData.append(hashParam, ffaListing.hash)
    formData.append(licenseParam, license)
    formData.append(transactionHashParam, transactionHash)
    formData.append(size, String(ffaListing.size))
  }

  public static renameFile(filename: string, newFilename: string, uploadModule: UploadModule) {
    // const uploadModule = getModule(UploadModule, store)
    uploadModule.setFilename(newFilename)
    uploadModule.setTitle(filename)
  }

  public static fileAdded(f: DropzoneFile, uploadModule: UploadModule) {

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
      uploadModule.setTitle(f.name)
      uploadModule.setSize(f.size)
    }
  }

  public static handleImproperFileType(fileType: string): string {
    return (fileType === '') ? FileHelper.UnknownType : fileType
  }
}
