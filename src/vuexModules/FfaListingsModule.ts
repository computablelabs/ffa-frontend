import {
  Module,
  VuexModule,
  Mutation,
  MutationAction } from 'vuex-module-decorators'
import FfaListing from '../models/FfaListing'

@Module({ namespaced: true, name: 'ffaListingsModule' })
export default class FfaListingsModule extends VuexModule {

  public candidates: FfaListing[] = []
  public listed: FfaListing[] = []
  public purchases: FfaListing[] = []

  @Mutation
  public reset() {
    this.candidates = []
    this.purchases = []
  }

  @Mutation
  public setCandidates(candidates: FfaListing[]) {
    this.candidates = candidates
  }

  @Mutation
  public addCandidate(candidate: FfaListing) {
    this.candidates.push(candidate)
  }

  @Mutation
  public promoteCandidate(candidate: FfaListing) {

    if (this.candidates.filter((c) => c.hash === candidate.hash).length < 1) {
      return
    }

    if (this.listed.filter((l) => l.hash === candidate.hash).length > 0) {
      return
    }

    this.listed.push(candidate)
    this.candidates = this.candidates.filter((f) => f.title !== candidate.title)
  }

  @Mutation
  public removeCandidate(candidate: FfaListing) {
    this.candidates = this.candidates.filter((f) => f.title !== candidate.title)
  }

  @Mutation
  public setListed(listed: FfaListing[]) {
    this.listed = listed
  }

  @Mutation
  public addToListed(listing: FfaListing) {
    this.listed.push(listing)
  }

  @Mutation
  public removeFromListed(listing: FfaListing) {
    this.listed = this.listed.filter((f) => f.title !== listing.title)
  }

  @MutationAction({mutate: ['candidates']})
  public async fetchCandidates() {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const file1 = new FfaListing('title1', 'description1', 'type1', 'hash1', 'md51', [])
    const file2 = new FfaListing('title2', 'description2', 'type2', 'hash2', 'md52', [])
    const file3 = new FfaListing('title3', 'description3', 'type3', 'hash3', 'md53', [])
    const file4 = new FfaListing('title4', 'description4', 'type4', 'hash4', 'md54', [])
    const file5 = new FfaListing('title5', 'description5', 'type5', 'hash5', 'md55', [])
    const candidates: FfaListing[] = [file1, file2, file3, file4, file5]
    const response = {
      candidates,
    }
    return response
  }

  get namespace(): string {
    return 'ffaListingsModule'
  }

  get allTitles(): string[] {
    const titles = this.candidates.map((c) => c.title)
    titles.concat(this.listed.map((l) => l.title))
    return titles
  }
}