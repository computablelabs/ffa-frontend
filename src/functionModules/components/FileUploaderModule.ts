import { DropzoneFile } from 'dropzone'
import SparkMD5 from 'spark-md5'

import UploadModule from '../../vuexModules/UploadModule'
import FfaListing from 'models/FfaListing'
import FileHelper from '../../util/FileHelper'
import { License } from '../../util/Constants'

export default class FileUploaderModule {

  public static preprocessFileData(
    f: DropzoneFile,
    formData: FormData,
    ffaListing: FfaListing,
    transactionHash: string)  {

    formData.append('md5_sum', ffaListing.md5)
    formData.append('file_type', this.handleImproperFileType(ffaListing.fileType))
    formData.append('tx_hash', transactionHash)
    formData.append('listing_hash', ffaListing.hash)
    formData.append('description', ffaListing.description)
    formData.append('tags', ffaListing.tags.join())
    formData.append('license', License.name)
    formData.append('owner', ethereum.selectedAddress)
    formData.append('title', ffaListing.title)
    formData.append('owner', ethereum.selectedAddress)
    formData.append('size', ffaListing.size.toString())
  }

  public static renameFile(
    filename: string,
    newFilename: string,
    uploadModule: UploadModule) {

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
