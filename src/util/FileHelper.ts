const emptyBlob = new Array<Blob>()
const emptyFile = new File(emptyBlob, 'Empty.file', { type: '' })
const specFile = new File(emptyBlob, 'A Dummy Empty File For Specs.doc', { type: 'application/msword'})

// See https://fontawesome.com/icons?d=gallery&m=free
const fileIcon = 'fileIcon'
const videoIcon = 'videoIcon'
const audioIcon = 'audioIcon'
const imageIcon = 'imageIcon'
const archiveIcon = 'archiveIcon'
const pdfIcon = 'pdfIcon'

const imageApplication = 'image'
const audioApplication = 'audio'
const videoApplication = 'video'
const appApplication = 'application'
const sevenZFormat = 'x-7z-compressed'
const rarFormat = 'x-rar-compressed'
const tarFormat = 'x-tar'
const freeArcFormat = 'x-freearc'
const bzipFormat = 'x-bzip'
const bzip2Format = 'x-bzip2'
const jarFormat = 'java-archive'
const zipFormat = 'zip'
const pdfFormat = 'pdf'
const gifExt = 'gif'
const jpegExt = 'jpeg'
const jpgExt = 'jpg'
const svgExt = 'svg'
const tiffExt = 'tiff'
const mp4Ext = 'mp4'
const m4vExt = 'm4v'
const aviExt = 'avi'
const qtExt = 'qt'
const mkvExt = 'mkv'
const mp3Ext = 'mp3'
const wavExt = 'wav'
const aiffExt = 'aiff'
const oggExt = 'ogg'
const sevenZExt = '7z'
const zipExt = 'zip'
const rarExt = 'rar'
const tarExt = 'tar'
const jarExt = 'jar'
const gzExt = 'gz'
const gzipExt = 'gzip'
const bzipExt = 'bzip'
const bzip2Ext = 'bzip2'
const bz2Ext = 'bz2'
const pdfExt = 'pdf'
const unknownType = 'unknown'

export default class FileHelper {

  public static EmptyFile = emptyFile
  public static SpecFile = specFile
  public static FileIcon = fileIcon
  public static ImageIcon = imageIcon
  public static AudioIcon = audioIcon
  public static VideoIcon = videoIcon
  public static PdfIcon = pdfIcon
  public static ArchiveIcon = archiveIcon
  public static UnknownType = unknownType

  public static fileSizeString(fileSizeInBytes: number): string {
    const KB = 1000
    const MB = 1000 * KB
    const GB = 1000 * MB

    if (Math.floor(fileSizeInBytes / GB) > 0) {
      return `${(fileSizeInBytes / GB).toFixed(1)} GB`
    }
    if (Math.floor(fileSizeInBytes / MB) > 0) {
      return `${(fileSizeInBytes / MB).toFixed(1)} MB`
    }
    if (Math.floor(fileSizeInBytes / KB) > 0) {
      return `${(fileSizeInBytes / KB).toFixed(0)} KB`
    }
    return `${fileSizeInBytes} bytes`
  }

  public static costString(bytes: number, weiPerByte: number): string {
    const costWei = weiPerByte * bytes
    const costETH = costWei / 1000000000000000000
    const displayLimit = 0.0001 // 1.6 cents at $160

    if ( costETH < displayLimit ) {
      // fractions of a cent
      return `less than ETH ${displayLimit}`
    }
    const roundedString = costETH.toFixed(4)
    // converting back to num removes trailing zeros
    const roundedNum = Number(roundedString)
    return `ETH ${roundedNum}`
  }

  public static mimeTypeIcon(mimeType: string): string {

    const splat = mimeType.split('/')
    if (splat.length < 2) {
      return FileHelper.FileIcon
    }

    const fileType = splat[0].toLowerCase()
    const fileFormat = splat[1].toLowerCase()

    switch (fileType) {
      case imageApplication:
        return imageIcon
      case videoApplication:
        return videoIcon
      case audioApplication:
        return audioIcon
      case appApplication: {
        switch (fileFormat) {
          case sevenZFormat:
          case rarFormat:
          case tarFormat:
          case freeArcFormat:
          case bzipFormat:
          case bzip2Format:
          case jarFormat:
          case zipFormat:
            return archiveIcon
          case pdfFormat:
            return pdfIcon
          default:
            return fileIcon
        }
      }
      default:
        return fileIcon
    }
  }

  public static mimeTypeIconByExtension(extension: string): string {

    switch (extension.toLowerCase()) {
      case gifExt:
      case jpegExt:
      case jpgExt:
      case svgExt:
      case tiffExt:
        return imageIcon
      case mp4Ext:
      case m4vExt:
      case aviExt:
      case qtExt:
      case mkvExt:
        return videoIcon
      case mp3Ext:
      case wavExt:
      case aiffExt:
      case oggExt:
        return audioIcon
      case sevenZExt:
      case zipExt:
      case rarExt:
      case tarExt:
      case jarExt:
      case gzExt:
      case gzipExt:
      case bzipExt:
      case bzip2Ext:
      case bz2Ext:
        return archiveIcon
      case pdfExt:
        return pdfIcon
      default:
        return fileIcon
    }
  }
}
