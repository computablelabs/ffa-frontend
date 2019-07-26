import {
  Module,
  VuexModule,
  Mutation,
  MutationAction } from 'vuex-module-decorators'
import FfaListing from '../models/FfaListing'

@Module({ namespaced: true, name: 'ffaListingsModule' })
export default class FfaListingsModule extends VuexModule {

  public uploads: FfaListing[] = []
  public purchases: FfaListing[] = []

  @Mutation
  public reset() {
    this.uploads = []
    this.purchases = []
  }

  @Mutation
  public setUserUploadeds(uploads: FfaListing[]) {
    this.uploads = uploads
  }

  @Mutation
  public addUpload(upload: FfaListing) {
    this.uploads.push(upload)
  }

  @Mutation
  public removeUpload(upload: FfaListing) {
    this.uploads = this.uploads.filter((f) => f.title !== upload.title)
  }

  @MutationAction({mutate: ['uploads']})
  public async fetchUploads() {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const file1 = new FfaListing('title1', 'description1', 'type1', 'hash1', 'md51', [])
    const file2 = new FfaListing('title2', 'description2', 'type2', 'hash2', 'md52', [])
    const file3 = new FfaListing('title3', 'description3', 'type3', 'hash3', 'md53', [])
    const file4 = new FfaListing('title4', 'description4', 'type4', 'hash4', 'md54', [])
    const file5 = new FfaListing('title5', 'description5', 'type5', 'hash5', 'md55', [])
    const uploads: FfaListing[] = [file1, file2, file3, file4, file5]
    const response = {
      uploads,
    }
    return response
  }

  get namespace(): string {
    return 'ffaListingsModule'
  }

  get uploadedTitles(): string[] {
    return this.uploads.map((f) => f.title)
  }

  public foo(): string {
    return 'foo'
  }
}
