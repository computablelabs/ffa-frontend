import { shallowMount } from '@vue/test-utils'
import FileHelper from '../../../src/util/FileHelper'

describe('FileHelper.ts', () => {

  it('correctly exposes static defaults', () => {
    expect(FileHelper.EmptyFile).not.toBeNull()
    expect(FileHelper.EmptyFile.name).toEqual('Empty.file')
    expect(FileHelper.EmptyFile.type).toEqual('')
    expect(FileHelper.EmptyFile.size).toBe(0)
    expect(FileHelper.SpecFile).not.toBeNull()
    expect(FileHelper.SpecFile.name).toEqual('A Dummy Empty File For Specs.doc')
    expect(FileHelper.SpecFile.type).toEqual('application/msword')
    expect(FileHelper.SpecFile.size).toBe(0)
  })

  it('correctly identifies mime types', () => {

    const imageType = 'image/tiff'
    const audioType = 'audio/aiff'
    const videoType = 'video/mp4'
    const pdfType = 'application/pdf'
    const archiveType = 'application/x-7z-compressed'

    const emptyAnswer = FileHelper.mimeTypeIcon('')
    expect(emptyAnswer).toBe(FileHelper.FileIcon)

    const imageAnswer = FileHelper.mimeTypeIcon(imageType)
    expect(imageAnswer).toBe(FileHelper.ImageIcon)

    const audioAnswer = FileHelper.mimeTypeIcon(audioType)
    expect(audioAnswer).toBe(FileHelper.AudioIcon)

    const videoAnswer = FileHelper.mimeTypeIcon(videoType)
    expect(videoAnswer).toBe(FileHelper.VideoIcon)

    const pdfAnswer = FileHelper.mimeTypeIcon(pdfType)
    expect(pdfAnswer).toBe(FileHelper.PdfIcon)

    const archiveAnswer = FileHelper.mimeTypeIcon(archiveType)
    expect(archiveAnswer).toBe(FileHelper.ArchiveIcon)
  })

  it('correctly identifies file extensions', () => {

    const emptyBlob = new Array<Blob>()

    const imageExtension = 'tiff'
    const imageExtension2 = 'JPG'
    const audioExtension = 'aiff'
    const audioExtension2 = 'OGG'
    const videoExtension = 'mp4'
    const videoExtension2 = 'AVI'
    const pdfExtension = 'pdf'
    const pdfExtension2 = 'PDF'
    const archiveExtension = '7z'
    const archiveExtension2 = 'RAR'

    const imageAnswer = FileHelper.mimeTypeIconByExtension(imageExtension)
    expect(imageAnswer).toBe(FileHelper.ImageIcon)

    const imageAnswer2 = FileHelper.mimeTypeIconByExtension(imageExtension2)
    expect(imageAnswer2).toBe(FileHelper.ImageIcon)

    const audioAnswer = FileHelper.mimeTypeIconByExtension(audioExtension)
    expect(audioAnswer).toBe(FileHelper.AudioIcon)

    const audioAnswer2 = FileHelper.mimeTypeIconByExtension(audioExtension2)
    expect(audioAnswer2).toBe(FileHelper.AudioIcon)

    const videoAnswer = FileHelper.mimeTypeIconByExtension(videoExtension)
    expect(videoAnswer).toBe(FileHelper.VideoIcon)

    const videoAnswer2 = FileHelper.mimeTypeIconByExtension(videoExtension2)
    expect(videoAnswer2).toBe(FileHelper.VideoIcon)

    const pdfAnswer = FileHelper.mimeTypeIconByExtension(pdfExtension)
    expect(pdfAnswer).toBe(FileHelper.PdfIcon)

    const pdfAnswer2 = FileHelper.mimeTypeIconByExtension(pdfExtension2)
    expect(pdfAnswer2).toBe(FileHelper.PdfIcon)

    const archiveAnswer = FileHelper.mimeTypeIconByExtension(archiveExtension)
    expect(archiveAnswer).toBe(FileHelper.ArchiveIcon)

    const archiveAnswer2 = FileHelper.mimeTypeIconByExtension(archiveExtension2)
    expect(archiveAnswer2).toBe(FileHelper.ArchiveIcon)
  })

  it('correctly calculates a cost string', () => {
    const weiPerBytes = 1e9 // 0.001 ETH per MB
    const oneKB = 1e3
    const gigs = 1.23456789e9

    expect(FileHelper.costString(oneKB, weiPerBytes)).toEqual('less than ETH 0.0001')
    expect(FileHelper.costString(gigs, weiPerBytes)).toEqual('ETH 1.2346')
  })
})
