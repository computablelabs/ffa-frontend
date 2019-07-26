import Indexable from 'interfaces/Indexable'

export default interface UploadStore extends Indexable {
  file: File
  originalFilename: string
  title: string
  description: string
  hash: string
  md5: string
  tags: string[]
}
