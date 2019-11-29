import {
  Module,
  VuexModule,
  Action,
  Mutation,
  MutationAction} from 'vuex-module-decorators'

import FfaListing, { FfaListingStatus} from '../models/FfaListing'
import DatatrustModule from '../functionModules/datatrust/DatatrustModule'

import Web3 from 'web3'

@Module({ namespaced: true, name: 'ffaListingsModule' })
export default class FfaListingsModule extends VuexModule {

  public static genesisBlock = Number(process.env.VUE_APP_GENESIS_BLOCK!)
  public static blockBatchSize = Number(process.env.VUE_APP_LISTING_BATCH_SIZE)
  public static maxRetries = 5

  public pendings: FfaListing[] = []
  public candidates: FfaListing[] = []
  public listed: FfaListing[] = []
  public purchases: FfaListing[] = []
  public lastBlock = 0
  public listedFromBlock = -1
  public listedBadBlockRangeMinimumBlock = 0
  public listedBatchSizeOverride = 0
  public listedRetryCount = 0
  public candidatesFromBlock = -1
  public candidatesBatchSizeOverride = 0
  public candidatesBadBlockRangeMinimumBlock = 0
  public candidateRetryCount = 0

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
  public addCandidates(candidatesListings: FfaListing[]) {
    this.candidates = this.candidates.concat(candidatesListings)
  }

  @Mutation
  public addListed(listedListings: FfaListing[]) {
    // TODO: check that all the hashes are unique.  NEVER add a redundant listing.
    this.listed = this.listed.concat(listedListings)
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
    if (this.listed.find((l) => l.hash === listing.hash) !== undefined) {
      return
    }
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

  @Mutation
  public setListedDetails(mutationPayload: object) {
    const { listingHash, newListedDetails } = (mutationPayload as any)
    const candidateDetails = this.candidates.find((candidate) => candidate.hash === listingHash)

    if (!!candidateDetails) {
      candidateDetails.fileType = String((newListedDetails as any)[0])
      candidateDetails.owner = String((newListedDetails as any)[1])
      candidateDetails.stake = Number((newListedDetails as any)[2])
      candidateDetails.voteBy = Number((newListedDetails as any)[3])
      candidateDetails.totalYeaVotes = Number((newListedDetails as any)[4])
      candidateDetails.totalNayVotes = Number((newListedDetails as any)[5])
    }
  }

  @Mutation
  public setListedFromBlock(listedFromBlock: number) {
    this.listedFromBlock = listedFromBlock
  }

  @Mutation
  public setCandidatesFromBlock(candidatesFromBlock: number) {
    this.candidatesFromBlock = candidatesFromBlock
  }

  @Action({ rawError: true })
  public async fetchNextListed(owner?: string|undefined) {

    if (this.listedFromBlock <= 0) {
      return
    }

    let loop = true

    while (loop) {
      const fetchEndBlock =
        Math.max(DatatrustModule.genesisBlock, this.listedFromBlock - DatatrustModule.blockBatchSize)

      const response = await DatatrustModule.fetchNextOf(
        true,
        this.listedFromBlock,
        0,
        FfaListingsModule.maxRetries,
        DatatrustModule.batchSizeForRetry,
        this.listedBatchSizeOverride,
        owner)

      const fromBlockDelta = this.listedFromBlock - response.fromBlock
      console.log(`listedFromBlock: ${this.listedFromBlock}`)
      console.log(`response.fromBlock: ${response.fromBlock}`)
      console.log(`fromBlockDelta: ${fromBlockDelta}`)
      if (response.fromBlock !== fetchEndBlock) {
        if ((this.listedBatchSizeOverride > 0 && fromBlockDelta < this.listedBatchSizeOverride) ||
          (this.listedBadBlockRangeMinimumBlock === 0 && fromBlockDelta < FfaListingsModule.blockBatchSize)) {
          console.log(`Found a bad block within range: fromBlock: ${response.fromBlock} toBlock: ${this.listedFromBlock}`)
          this.listedBadBlockRangeMinimumBlock = response.fromBlock
          this.listedBatchSizeOverride = fromBlockDelta
          console.log(`Setting listedBadBlockRangeMinimumBlock: ${this.listedBadBlockRangeMinimumBlock}`)
          console.log(`Setting listedBatchSizeOverride: ${this.listedBatchSizeOverride}`)
        } else if (response.fromBlock <= this.listedBadBlockRangeMinimumBlock) {
          console.log(`Reached bottom of bad block range: ${this.listedBadBlockRangeMinimumBlock}`)
          this.listedBadBlockRangeMinimumBlock = 0
          this.listedBatchSizeOverride = 0
          console.log(`Setting listedBadBlockRangeMinimumBlock: ${this.listedBadBlockRangeMinimumBlock}`)
          console.log(`Setting listedBatchSizeOverride: ${this.listedBatchSizeOverride}`)
        }
      } else {
        console.log(`Reached fetch end block`)
        loop = false
      }
      this.context.commit('setListedFromBlock', response.fromBlock)
      this.context.commit('addListed', response.listings)
    }
  }

  @Action({ rawError: true }  )
  public async fetchNextCandidates(owner?: string|undefined) {

    if (this.candidatesFromBlock <= 0) {
      return
    }

    let loop = true

    while (loop) {
      const fetchEndBlock =
        Math.max(DatatrustModule.genesisBlock, this.candidatesFromBlock - DatatrustModule.blockBatchSize)

      const response = await DatatrustModule.fetchNextOf(
        false,
        this.candidatesFromBlock,
        0,
        FfaListingsModule.maxRetries,
        DatatrustModule.batchSizeForRetry,
        this.candidatesBatchSizeOverride,
        owner)

      const fromBlockDelta = this.candidatesFromBlock - response.fromBlock
      console.log(`candidatesFromBlock: ${this.candidatesFromBlock}`)
      console.log(`response.fromBlock: ${response.fromBlock}`)
      console.log(`fromBlockDelta: ${fromBlockDelta}`)
      if (response.fromBlock !== fetchEndBlock) {
        if ((this.candidatesBatchSizeOverride > 0 && fromBlockDelta < this.candidatesBatchSizeOverride) ||
          (this.candidatesBadBlockRangeMinimumBlock === 0 && fromBlockDelta < FfaListingsModule.blockBatchSize)) {
          console.log(`Found a bad block within range: fromBlock: ${response.fromBlock} toBlock: ${this.candidatesFromBlock}`)
          this.candidatesBadBlockRangeMinimumBlock = response.fromBlock
          this.candidatesBatchSizeOverride = fromBlockDelta
          console.log(`Setting candidatesBadBlockRangeMinimumBlock: ${this.candidatesBadBlockRangeMinimumBlock}`)
          console.log(`Setting candidatesBatchSizeOverride: ${this.candidatesBatchSizeOverride}`)
        } else if (response.fromBlock <= this.candidatesBadBlockRangeMinimumBlock) {
          console.log(`Reached bottom of bad block range: ${this.candidatesBadBlockRangeMinimumBlock}`)
          this.candidatesBadBlockRangeMinimumBlock = 0
          this.candidatesBatchSizeOverride = 0
          console.log(`Setting candidatesBadBlockRangeMinimumBlock: ${this.candidatesBadBlockRangeMinimumBlock}`)
          console.log(`Setting candidatesBatchSizeOverride: ${this.candidatesBatchSizeOverride}`)
        }
      } else {
        console.log(`Reached fetch end block`)
        loop = false
      }

      this.context.commit('setCandidatesFromBlock', response.fromBlock)
      this.context.commit('addCandidates', response.listings)
    }
  }

  @Mutation
  public async fetchAllListed(owner?: string|undefined) {
    while (this.listedFromBlock > 0) {
      try {
        const response = await DatatrustModule.fetchNextOf(
          true,
          this.listedFromBlock,
          0,
          FfaListingsModule.maxRetries,
          DatatrustModule.batchSizeForRetry,
          this.listedBatchSizeOverride,
          owner)

        const fromBlockDelta = this.listedFromBlock - response.fromBlock
        console.log(`listedFromBlock: ${this.listedFromBlock}`)
        console.log(`response.fromBlock: ${response.fromBlock}`)
        console.log(`fromBlockDelta: ${fromBlockDelta}`)
        if (response.fromBlock !== FfaListingsModule.genesisBlock) {
          if ((this.listedBatchSizeOverride > 0 && fromBlockDelta < this.listedBatchSizeOverride) ||
            (this.listedBadBlockRangeMinimumBlock === 0 && fromBlockDelta < FfaListingsModule.blockBatchSize)) {
            console.log(`Found a bad block within range: fromBlock: ${response.fromBlock} toBlock: ${this.listedFromBlock}`)
            this.listedBadBlockRangeMinimumBlock = response.fromBlock
            this.listedBatchSizeOverride = fromBlockDelta
            console.log(`Setting listedBadBlockRangeMinimumBlock: ${this.listedBadBlockRangeMinimumBlock}`)
            console.log(`Setting listedBatchSizeOverride: ${this.listedBatchSizeOverride}`)
          } else if (response.fromBlock <= this.listedBadBlockRangeMinimumBlock) {
            console.log(`Reached bottom of bad block range: ${this.listedBadBlockRangeMinimumBlock}`)
            this.listedBadBlockRangeMinimumBlock = 0
            this.listedBatchSizeOverride = 0
            console.log(`Setting listedBadBlockRangeMinimumBlock: ${this.listedBadBlockRangeMinimumBlock}`)
            console.log(`Setting listedBatchSizeOverride: ${this.listedBatchSizeOverride}`)
          }
        } else {
          console.log(`Reached genesis block`)
        }

        this.listedFromBlock = response.fromBlock
        this.listed.concat(response.listings)

      } catch (error) {
        break
      }
    }
  }

  @Mutation
  public async fetchAllCandidates(owner?: string|undefined) {
    while (this.candidatesFromBlock > 0) {
      try {
        const response = await DatatrustModule.fetchNextOf(
          false,
          this.lastBlock,
          0,
          FfaListingsModule.maxRetries,
          DatatrustModule.batchSizeForRetry,
          this.candidatesBatchSizeOverride,
          owner)
        this.listedFromBlock = response.fromBlock
        this.listed.concat(response.listings)
      } catch (error) {
        break
      }
    }
  }

  @Mutation
  public resetListed(lastBlock: number) {
    this.lastBlock = lastBlock
    this.listed = []
    this.listedFromBlock = this.lastBlock
    this.listedRetryCount = 0
  }

  @Mutation
  public resetCandidates(lastBlock: number) {
    this.lastBlock = lastBlock
    this.candidates = []
    this.candidatesFromBlock = this.lastBlock
    this.candidateRetryCount = 0
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
    return this.candidates.concat(this.listed)
  }

  get hasMoreListed(): boolean {
    return this.listedFromBlock > FfaListingsModule.genesisBlock
  }

  get hasMoreCandidates(): boolean {
    return this.candidatesFromBlock > FfaListingsModule.genesisBlock
  }
}
