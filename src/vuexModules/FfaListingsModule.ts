import {
  Module,
  VuexModule,
  Mutation,
  MutationAction } from 'vuex-module-decorators'
import FfaListing, { FfaListingStatus} from '../models/FfaListing'
import DatatrustModule from '../functionModules/datatrust/DatatrustModule'

@Module({ namespaced: true, name: 'ffaListingsModule' })
export default class FfaListingsModule extends VuexModule {

  public candidates: FfaListing[] = []
  public listed: FfaListing[] = []
  public purchases: FfaListing[] = []
  public lastCandidatesBlock: number = 0
  public lastListedBlock: number = 0

  @Mutation
  public reset() {
    this.candidates = []
    this.purchases = []
 }

 @Mutation
 public clearAll() {
   this.candidates = []
   this.listed = []
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
  public addCandidateObjects(candidateObjects: object[]) {
    for (const candidateObject of candidateObjects!) {
      this.addCandidate(this.createFfaListings(candidateObject))
    }
  }

  @Mutation
  public addListedObjects(listedObjects: object[]) {
    for (const listedObject of listedObjects!) {
      this.addCandidate(this.createFfaListings(listedObject))
    }
  }

  @Mutation
  public setLastCandidatesBlock(lastCandidatesBlock: number) {
    this.lastCandidatesBlock = lastCandidatesBlock
  }

  @Mutation
  public setLastListedBlock(lastListedBlock: number) {
    this.lastListedBlock = lastListedBlock
  }

  @Mutation
  public promoteCandidate(candidate: FfaListing) {

    if (this.candidates.filter((c) => c.hash === candidate.hash).length < 1) {
      return
    }

    if (this.listed.filter((l) => l.hash === candidate.hash).length > 0) {
      return
    }

    candidate.status = FfaListingStatus.listed

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

  @MutationAction({mutate: ['candidates', 'lastCandidatesBlock']})
  public async fetchCandidates() {
    const [
      error,
      candidateObjects,
      newLastCandidatesBlock,
    ] = await DatatrustModule.getCandidates(this.lastCandidatesBlock)

    if (!!!error) {
      this.addCandidateObjects(candidateObjects!)
      this.setLastCandidatesBlock(newLastCandidatesBlock!)
    }

    return {
      candidates: this.candidates,
      lastCandidatesBlock: this.lastCandidatesBlock,
    }
  }

  @MutationAction({mutate: ['listed', 'lastListedBlock']})
  public async fetchListed() {
    const [
      error,
      listedObjects,
      newLastListedBlock,
    ] = await DatatrustModule.getListed(this.lastListedBlock)

    if (!!!error) {
      this.addCandidateObjects(listedObjects!)
      this.setLastCandidatesBlock(newLastListedBlock!)
    }

    return {
      listed: this.listed,
      lastListedBlock: this.lastListedBlock,
    }
  }

  get namespace(): string {
    return 'ffaListingsModule'
  }

  get allTitles(): string[] {
    const titles = this.candidates.map((c) => c.title)
    titles.concat(this.listed.map((l) => l.title))
    return titles
  }

  get allListings(): FfaListing[] {
    return this.candidates.concat(this.listed)
  }

  public createFfaListings = (listingObject: any): FfaListing => {
    return new FfaListing(listingObject.title,
                          listingObject.description,
                          listingObject.type,
                          listingObject.hash,
                          listingObject.md5,
                          listingObject.tags,
                          listingObject.status,
                          listingObject.owner)
  }

}
