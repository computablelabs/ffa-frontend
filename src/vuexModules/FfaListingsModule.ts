import {
  Module,
  VuexModule,
  Action,
  Mutation } from 'vuex-module-decorators'
import FfaListing, { FfaListingStatus} from '../models/FfaListing'
import DatatrustModule from '../functionModules/datatrust/DatatrustModule'
import { hash } from 'spark-md5'

@Module({ namespaced: true, name: 'ffaListingsModule' })
export default class FfaListingsModule extends VuexModule {

  public pendings: FfaListing[] = []
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
  public addPending(pending: FfaListing) {
    if (this.pendings.find((p) => p.hash === pending.hash) !== undefined) {
      return
    }
    this.pendings.push(pending)
  }

  @Mutation
  public promotePending(listingHash: string) {
    const pending = this.pendings.find((p) => p.hash === listingHash)
    if (pending === undefined) {
      return
    }

    this.pendings = this.pendings.filter((p) => p.hash !== pending.hash)

    if (this.candidates.find((c) => c.hash === pending.hash) !== undefined) {
      return
    }

    pending.status = FfaListingStatus.candidate
    this.candidates.push(pending)
  }

  @Mutation
  public setCandidates(candidates: FfaListing[]) {
    this.candidates = candidates
  }

  @Mutation
  public addCandidate(candidate: FfaListing) {
    if (this.candidates.find((c) => c.hash === candidate.hash) !== undefined) {
      return
    }
    this.candidates.push(candidate)
  }

  @Mutation
  public addCandidates(candidateListings: FfaListing[]) {
    this.candidates = this.candidates.concat(candidateListings)
  }

  @Mutation
  public addListedListings(listedListings: FfaListing[]) {
    // TODO: check that all the hashes are unique.  NEVER add a redundant listing.
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
  public promoteCandidate(listingHash: string) {

    const candidate = this.candidates.find((c) => c.hash === listingHash)
    if (candidate === undefined) {
      return
    }

    this.candidates = this.candidates.filter((c) => c.hash !== candidate.hash)
    if (this.listed.find((l) => l.hash === candidate.hash) !== undefined) {
      return
    }
    candidate.status = FfaListingStatus.listed
    this.listed.push(candidate)
  }


  @Mutation
  public purchaseListing(listingHash: string) {
    const listed = this.listed.find((l) => l.hash === listingHash)
    if (listed === undefined) {
      return
    }

    if (this.purchases.find((p) => p.hash === listed.hash) !== undefined) {
      return
    }
    this.purchases.push(listed)
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
      candidateDetails.fileType = String((newCandidateDetails as any)[0])
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
    let titles = this.pendings.map((p) => p.title)
    titles = titles.concat(this.candidates.map((c) => c.title))
    titles = titles.concat(this.listed.map((l) => l.title))
    return titles
  }

  get allListings(): FfaListing[] {
    return this.pendings.concat(this.candidates.concat(this.listed))
  }
}
