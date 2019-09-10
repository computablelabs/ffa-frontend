import {
  Module,
  VuexModule,
  Action,
  Mutation,
  MutationAction } from 'vuex-module-decorators'
import FfaListing, { FfaListingStatus} from '../models/FfaListing'
import DatatrustModule from '../functionModules/datatrust/DatatrustModule'

@Module({ namespaced: true, name: 'ffaListingsModule' })
export default class FfaListingsModule extends VuexModule {

  public candidates: FfaListing[] = []

  public listed: FfaListing[] = []
  public purchases: FfaListing[] = []
  public lastCandidateBlock: number = 0
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
  public addCandidates(candidateListings: FfaListing[]) {
    this.candidates = this.candidates.concat(candidateListings)
  }

  @Mutation
  public addListedListings(listedListings: FfaListing[]) {
    this.listed = this.listed.concat(listedListings)
  }

  @Mutation
  public setLastCandidateBlock(lastCandidateBlock: number) {
    this.lastCandidateBlock = lastCandidateBlock
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
    const x = this.candidates.filter((f) => f.hash !== candidate.hash)
    this.candidates = this.candidates.filter((f) => f.hash !== candidate.hash)
  }

  @Mutation
  public removeCandidate(listingHash: string) {
    this.candidates = this.candidates.filter((f) => f.hash !== listingHash)
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
  public removeFromListed(listingHash: string) {
    this.listed = this.listed.filter((f) => f.hash !== listingHash)
  }

  @Mutation
  public setCandidateDetails(mutationPayload: object) {
    const { listingHash, newCandidateDetails } = (mutationPayload as any)
    const candidateDetails = this.candidates.find((candidate) => candidate.hash === listingHash)

    if (!!candidateDetails) {
      candidateDetails.type = String((newCandidateDetails as any)[0])
      candidateDetails.owner = String((newCandidateDetails as any)[1])
      candidateDetails.stake = Number((newCandidateDetails as any)[2])
      candidateDetails.voteBy = Number((newCandidateDetails as any)[3])
      candidateDetails.totalYeaVotes = Number((newCandidateDetails as any)[4])
      candidateDetails.totalNayVotes = Number((newCandidateDetails as any)[5])
    }
  }

  @Action
  public async fetchCandidates() {
    const [
      error,
      candidateListings,
      newLastCandidateBlock,
    ] = await DatatrustModule.getCandidates(this.lastCandidateBlock)

    if (!!!error) {
      this.context.commit('addCandidates', candidateListings)
      this.context.commit('setLastCandidateBlock', newLastCandidateBlock)
    }
  }

  @Action
  public async fetchListed() {
    const [
      error,
      listedListings,
      newLastListedBlock,
    ] = await DatatrustModule.getListed(this.lastListedBlock)

    if (!!!error) {
      this.context.commit('addListedListings', listedListings)
      this.context.commit('setLastListedBlock', newLastListedBlock)
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
}
