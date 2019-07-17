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
    expectIconArray(FileHelper.FileIcon, FileHelper.FileIcon)
    expect(FileHelper.FileIcon[0]).toEqual('far')
    expect(FileHelper.FileIcon[1]).toEqual('file')
  })

  it('correctly identifies mime types', () => {

    const imageType = 'image/tiff'
    const audioType = 'audio/aiff'
    const videoType = 'video/mp4'
    const pdfType = 'application/pdf'
    const archiveType = 'application/x-7z-compressed'

    const emptyAnswer = FileHelper.mimeTypeIcon('')
    expectIconArray(emptyAnswer, FileHelper.FileIcon)

    const imageAnswer = FileHelper.mimeTypeIcon(imageType)
    expectIconArray(imageAnswer, FileHelper.ImageIcon)

    const audioAnswer = FileHelper.mimeTypeIcon(audioType)
    expectIconArray(audioAnswer, FileHelper.AudioIcon)

    const videoAnswer = FileHelper.mimeTypeIcon(videoType)
    expectIconArray(videoAnswer, FileHelper.VideoIcon)

    const pdfAnswer = FileHelper.mimeTypeIcon(pdfType)
    expectIconArray(pdfAnswer, FileHelper.PdfIcon)

    const archiveAnswer = FileHelper.mimeTypeIcon(archiveType)
    expectIconArray(archiveAnswer, FileHelper.ArchiveIcon)
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
    expectIconArray(imageAnswer, FileHelper.ImageIcon)

    const imageAnswer2 = FileHelper.mimeTypeIconByExtension(imageExtension2)
    expectIconArray(imageAnswer2, FileHelper.ImageIcon)

    const audioAnswer = FileHelper.mimeTypeIconByExtension(audioExtension)
    expectIconArray(audioAnswer, FileHelper.AudioIcon)

    const audioAnswer2 = FileHelper.mimeTypeIconByExtension(audioExtension2)
    expectIconArray(audioAnswer2, FileHelper.AudioIcon)

    const videoAnswer = FileHelper.mimeTypeIconByExtension(videoExtension)
    expectIconArray(videoAnswer, FileHelper.VideoIcon)

    const videoAnswer2 = FileHelper.mimeTypeIconByExtension(videoExtension2)
    expectIconArray(videoAnswer2, FileHelper.VideoIcon)

    const pdfAnswer = FileHelper.mimeTypeIconByExtension(pdfExtension)
    expectIconArray(pdfAnswer, FileHelper.PdfIcon)

    const pdfAnswer2 = FileHelper.mimeTypeIconByExtension(pdfExtension2)
    expectIconArray(pdfAnswer2, FileHelper.PdfIcon)

    const archiveAnswer = FileHelper.mimeTypeIconByExtension(archiveExtension)
    expectIconArray(archiveAnswer, FileHelper.ArchiveIcon)

    const archiveAnswer2 = FileHelper.mimeTypeIconByExtension(archiveExtension2)
    expectIconArray(archiveAnswer2, FileHelper.ArchiveIcon)
  })
})

const expectIconArray = (answer: string[], expected: string[]) => {
  expect(answer).not.toBeNull()
  expect(Array.isArray(answer)).toBeTruthy()
  expect(answer.length).toBe(expected.length)
  expect(answer.length).toBe(2)
  expect(answer[0]).toEqual(expected[0])
  expect(answer[1]).toEqual(expected[1])
}
