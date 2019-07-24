export default interface UploadStore {
  currentFile: File
  originalFilename: string
  title: string
  description: string
  hash: string
  tags: string[]
}
