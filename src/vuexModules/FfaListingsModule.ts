import {
  Module,
  VuexModule,
  Action,
  Mutation} from 'vuex-module-decorators'

import FfaListing, { FfaListingStatus} from '../models/FfaListing'
import DatatrustModule from '../functionModules/datatrust/DatatrustModule'

import axios, { CancelTokenSource, CancelToken } from 'axios'

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
  public isFetchingListed = false
  public candidatesFromBlock = -1
  public candidatesBatchSizeOverride = 0
  public candidatesBadBlockRangeMinimumBlock = 0
  public candidatesRetryCount = 0
  public isFetchingCandidates = false
  public cancelTokenSource = axios.CancelToken.source()

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

    if (this.isFetchingListed) {
      return
    }

    if (this.listedFromBlock <= 0) {
      return
    }

    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel()
    }

    const cancelTokenSource = axios.CancelToken.source()
    this.context.commit('setCancelTokenSource', cancelTokenSource)
    let loop = true

    while (loop) {
      try {
        const expectedBatchSize = this.listedBatchSizeOverride > 0 ?
          this.listedBatchSizeOverride : DatatrustModule.blockBatchSize
        const fetchEndBlock =
          Math.max(DatatrustModule.genesisBlock, this.listedFromBlock - expectedBatchSize)

        this.context.commit('setIsFetchingListed', true)

        const response = await DatatrustModule.fetchNextOf(
          true,
          this.listedFromBlock,
          0,
          FfaListingsModule.maxRetries,
          this.cancelTokenSource.token,
          DatatrustModule.batchSizeForRetry,
          this.listedBatchSizeOverride,
          owner)

        const fromBlockDelta = this.listedFromBlock - response.fromBlock
        console.log(`listedFromBlock: ${this.listedFromBlock}`)
        console.log(`response.fromBlock: ${response.fromBlock}`)
        console.log(`fromBlockDelta: ${fromBlockDelta}`)
        console.log(`fetchEndBlock: ${fetchEndBlock}`)

        if (response.fromBlock > fetchEndBlock) {
          console.log(`Found a bad block within range: fromBlock: ${fetchEndBlock} toBlock: ${this.listedFromBlock}`)
          if ((this.listedBatchSizeOverride === 0 && fromBlockDelta < DatatrustModule.blockBatchSize) ||
          (this.listedBatchSizeOverride > 0 && fromBlockDelta < this.listedBatchSizeOverride)) {

            this.context.commit('setListedBadBlockRangeMinimumBlock', fetchEndBlock)
            this.context.commit('setListedBatchSizeOverride', fromBlockDelta)
            console.log(`Setting listedBadBlockRangeMinimumBlock: ${this.listedBadBlockRangeMinimumBlock}`)
            console.log(`Setting listedBatchSizeOverride: ${this.listedBatchSizeOverride}`)

          }
        } else {
            console.log(`Reached fetch end block`)
            loop = false
        }
        if (this.listedBadBlockRangeMinimumBlock > 0 && response.fromBlock <= this.listedBadBlockRangeMinimumBlock) {

          console.log(`Reached bottom of bad block range: ${this.listedBadBlockRangeMinimumBlock}`)
          this.context.commit('setListedBadBlockRangeMinimumBlock', 0)
          this.context.commit('setListedBatchSizeOverride', 0)
          console.log(`Setting listedBadBlockRangeMinimumBlock: ${this.listedBadBlockRangeMinimumBlock}`)
          console.log(`Setting listedBatchSizeOverride: ${this.listedBatchSizeOverride}`)
        }

        this.context.commit('setListedFromBlock', response.fromBlock)
        this.context.commit('addListed', response.listings)
      } catch (error) {
        console.log(error)
        throw Error('I DONE ERRORED')
        return
      } finally {
        this.context.commit('setIsFetchingListed', false)
      }
    }
  }

  @Action({ rawError: true }  )
  public async fetchNextCandidates(owner?: string|undefined) {

    if (this.isFetchingCandidates) {
      return
    }

    if (this.candidatesFromBlock <= 0) {
      return
    }

    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel()
    }
    const cancelTokenSource = axios.CancelToken.source()
    this.context.commit('setCancelTokenSource', cancelTokenSource)
    let loop = true

    while (loop) {
      try {

        const expectedBatchSize = this.candidatesBatchSizeOverride > 0 ?
                  this.candidatesBatchSizeOverride : DatatrustModule.blockBatchSize
        const fetchEndBlock =
                  Math.max(DatatrustModule.genesisBlock, this.candidatesFromBlock - expectedBatchSize)

        this.context.commit('setIsFetchingCandidates', true)
        const response = await DatatrustModule.fetchNextOf(
          false,
          this.candidatesFromBlock,
          0,
          FfaListingsModule.maxRetries,
          this.cancelTokenSource.token,
          DatatrustModule.batchSizeForRetry,
          this.candidatesBatchSizeOverride,
          owner)

        const fromBlockDelta = this.candidatesFromBlock - response.fromBlock
        console.log(`candidatesFromBlock: ${this.candidatesFromBlock}`)
        console.log(`response.fromBlock: ${response.fromBlock}`)
        console.log(`fromBlockDelta: ${fromBlockDelta}`)
        console.log(`fetchEndBlock: ${fetchEndBlock}`)

        if (response.fromBlock > fetchEndBlock) {
          // @ts-ignore
          console.log(`Found bad block range: fromBlock: ${fetchEndBlock} toBlock: ${this.candidatesFromBlock}`)
          if ((this.candidatesBatchSizeOverride === 0 && fromBlockDelta < DatatrustModule.blockBatchSize) ||
          (this.candidatesBatchSizeOverride > 0 && fromBlockDelta < this.candidatesBatchSizeOverride)) {

            this.context.commit('setCandidatesBadBlockRangeMinimumBlock', fetchEndBlock)
            this.context.commit('setCandidatesBatchSizeOverride', fromBlockDelta)
            console.log(`Setting candidatesBadBlockRangeMinimumBlock: ${this.candidatesBadBlockRangeMinimumBlock}`)
            console.log(`Setting candidatesBatchSizeOverride: ${this.candidatesBatchSizeOverride}`)

          }
        } else {
            console.log(`Reached fetch end block`)
            loop = false
        }

        if (this.candidatesBadBlockRangeMinimumBlock > 0 &&
          response.fromBlock <= this.candidatesBadBlockRangeMinimumBlock) {

          console.log(`Reached bottom of bad block range: ${this.candidatesBadBlockRangeMinimumBlock}`)
          this.context.commit('setCandidatesBadBlockRangeMinimumBlock', 0)
          this.context.commit('setCandidatesBatchSizeOverride', 0)
          console.log(`Setting candidatesBadBlockRangeMinimumBlock: ${this.candidatesBadBlockRangeMinimumBlock}`)
          console.log(`Setting candidatesBatchSizeOverride: ${this.candidatesBatchSizeOverride}`)
        }

        this.context.commit('setCandidatesFromBlock', response.fromBlock)
        this.context.commit('addCandidates', response.listings)
      } catch (error) {
        console.log(error)
        return
      } finally {
          this.context.commit('setIsFetchingCandidates', false)
      }
    }
  }

  @Action({ rawError: true }  )
  public async fetchUserListed(toBlock: number, owner: string, cancelToken: CancelToken) {
    const listed = await DatatrustModule.getUserListeds(toBlock, owner, cancelToken)
    this.context.commit('setListed', listed)
  }

  @Mutation
  public resetListed(lastBlock: number) {
    this.lastBlock = lastBlock
    this.listed = []
    this.listedFromBlock = this.lastBlock
    this.listedRetryCount = 0
    this.isFetchingListed = false
    this.listedBadBlockRangeMinimumBlock = 0
    this.listedBatchSizeOverride = 0
  }

  @Mutation
  public resetCandidates(lastBlock: number) {
    this.lastBlock = lastBlock
    this.candidates = []
    this.candidatesFromBlock = this.lastBlock
    this.candidatesRetryCount = 0
    this.isFetchingCandidates = false
    this.candidatesBadBlockRangeMinimumBlock = 0
    this.candidatesBatchSizeOverride = 0
  }

  @Mutation
  public setIsFetchingListed(isFetching: boolean) {
    this.isFetchingListed = isFetching
  }

  @Mutation
  public setIsFetchingCandidates(isFetching: boolean) {
    this.isFetchingCandidates = isFetching
  }

  @Mutation
  public setListedBadBlockRangeMinimumBlock(block: number) {
    this.listedBadBlockRangeMinimumBlock = block
  }

  @Mutation
  public setListedBatchSizeOverride(batchSize: number) {
    this.listedBatchSizeOverride = batchSize
  }

  @Mutation
  public setCandidatesBadBlockRangeMinimumBlock(block: number) {
    this.candidatesBadBlockRangeMinimumBlock = block
  }

  @Mutation
  public setCandidatesBatchSizeOverride(batchSize: number) {
    this.candidatesBatchSizeOverride = batchSize
  }

  @Mutation
  public setCancelTokenSource(cancelTokenSource: CancelTokenSource) {
    this.cancelTokenSource = cancelTokenSource
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
