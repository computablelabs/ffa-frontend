import axios from 'axios'
import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'
import AppModule from '../../vuexModules/AppModule'

import FfaListing, { FfaListingStatus } from '../../models/FfaListing'

import Servers from '../../util/Servers'
import Paths from '../../util/Paths'
import DatatrustTask from '../../models/DatatrustTask'
import { DatatrustTaskStatus } from '../../models/DatatrustTaskDetails'

interface DatatrustItem {
  description: string
  status: string
  title: string
  license: string
  listing_hash: string
  hash: string
  file_type: string
  fileType: string
  tags: string[]
}

interface PostAuthorizeResponse {
  message: string
  access_token: string
  refresh_token: string
}

interface GetListingsResponse {
  listings: FfaListing[]
  fromBlock: number
}

interface GetTaskResponse {
  message: string
  status: DatatrustTaskStatus
  result: string
}

interface PostTaskResponse {
  message: string
  task_id: string
}

export default class DatatrustModule {

  public static genesisBlock = Number(process.env.VUE_APP_GENESIS_BLOCK!)
  public static blockBatchSize = Number(process.env.VUE_APP_LISTING_BATCH_SIZE)

  public static async authorize(
    message: string,
    signature: string,
    publicKey: string): Promise<[Error?, string?]> {

    const headers = {
      'Content-Type': 'application/json',
    }

    const axiosConfig = {
      headers,
    }

    const data = {
      message,
      signature,
      public_key: publicKey,
    }

    const response = await axios.post<PostAuthorizeResponse>(
      `${Servers.Datatrust}${Paths.AuthorizePath}`,
      data,
      axiosConfig)

    if (response.status !== 200) {
      return [Error(`Access denied: ${response.status}: ${response.statusText}`), undefined]
    }

    return [undefined, response.data.access_token]
  }

  public static async getUserListed(toBlock: number): Promise<FfaListing[]> {
    return await DatatrustModule.getListed(toBlock, ethereum.selectedAddress)
  }

  public static async getListed(toBlock: number, ownerHash?: string): Promise<FfaListing[]> {

    const batchUrls = DatatrustModule.createBatches(
      this.genesisBlock,
      toBlock,
      ownerHash,
      DatatrustModule.generateGetListedUrl)

    const batchListings = await Promise.all(
      batchUrls.map(async (url: string) => {
        return await DatatrustModule.fetchListingsBatch(url) }))

    return this.flatten(batchListings)
  }

  public static async getUserCandidates(toBlock: number): Promise<FfaListing[]> {
    return await DatatrustModule.getCandidates(toBlock, ethereum.selectedAddress)
  }

  public static async getCandidates(toBlock: number, ownerHash?: string): Promise<FfaListing[]> {

    const batchUrls = DatatrustModule.createBatches(
      this.genesisBlock,
      toBlock,
      ownerHash,
      DatatrustModule.generateGetCandidatesUrl)

    const batchListings = await Promise.all(
      batchUrls.map(async (url: string) => {
        return await DatatrustModule.fetchListingsBatch(url) }))

    return this.flatten(batchListings)
  }

  public static createBatches(
    fromBlock: number = this.genesisBlock,
    toBlock: number,
    ownerHash: string|undefined,
    urlGenerator: (fromBlock: number, toBlock: number, ownerHash?: string) => string): string[] {

    if (toBlock < fromBlock) {
      return []
    }

    const batchUrls: string[] = []
    let numBatches = 1
    if (toBlock > 0) {
      numBatches = Math.ceil((toBlock - fromBlock) / this.blockBatchSize)
    }
    for (let i  = 0; i < numBatches; i++) {
      const batchFromBlock = fromBlock + Math.max(0, i * this.blockBatchSize)
      const batchToBlock = Math.min(toBlock, fromBlock + (((i + 1) * this.blockBatchSize) - 1))
      batchUrls.push(urlGenerator(batchFromBlock, batchToBlock, ownerHash))
    }
    return batchUrls
  }

  public static async fetchListingsBatch(url: string): Promise<FfaListing[]> {
    try {
      const response = await axios.get<GetListingsResponse>(url, {
        transformResponse: [(data, headers) => {

          data = JSON.parse(data)
          if (!!!data.items) {
            return data
          }

          data.items.forEach((o: DatatrustItem) => {
            o.status = FfaListingStatus.listed
            o.fileType = o.file_type
            delete o.file_type
            o.hash = o.listing_hash
            delete o.listing_hash
          })
          data.listings = data.items
          delete data.items
          return data
        }],
      })

      if (response.status !== 200) {
        return []
      }

      return response.data.listings
    } catch (error) {
      return []
    }
  }

  public static async createTask(transactionId: string): Promise<[Error?, string?]> {
    console.log('DatatrustModule::createTask')
    const url = `${Servers.Datatrust}/tasks/`
    const response = await axios.post<PostTaskResponse>(url, { tx_hash: transactionId })

    if (response.status !== 201) {
      return [Error(`Failed to create task: ${response.status}: ${response.statusText}`), undefined]
    }

    const uuid = response.data.task_id
    return [undefined, uuid]
  }

  public static async getTask(uuid: string, appStore: Store<any>): Promise<[Error?, DatatrustTask?]> {
    console.log('DatatrustModule::getTask')
    const url = `${Servers.Datatrust}/tasks/${uuid}`
    const response = await axios.get<GetTaskResponse>(url)

    const datatrustTaskModule = getModule(DatatrustTaskModule, appStore)
    const task = datatrustTaskModule.tasks.find((t) => t.key === uuid)

    if (!task) {
      return [Error(`Task with id ${uuid} not found!: ${response.status}: ${response.statusText}`), undefined]
    }

    switch (response.status) {

      case 200:

        task.payload.status = response.data.status

        if (response.data.result) {
          task.payload.transactionHash = response.data.result
        }

        return [undefined, task]

      case 504:

        datatrustTaskModule.failTask({
          uuid,
          response,
          error: undefined})

      default:
        return [Error(`Failed to get task: ${response.status}: ${response.statusText}`), undefined]
    }


  }

  public static async getPreview(
    listingHash: string,
    jwt: string): Promise<[Error?, any?]> {

      const headers = { Authorization: `Bearer ${jwt}` }

      const url = this.generatePreviewUrl(listingHash)

      const response = await axios.get(url, {
        headers,
        responseType: 'arraybuffer',
      })

      if (response.status !== 200) {
        let message = `Failed to retrieve preview for listing hash ${listingHash}: `
        message += `${response.status}: ${response.statusText}`
        return [Error(message), undefined]
      }

      return [undefined, response]
    }

  public static async getDelivery(
    deliveryHash: string,
    listingHash: string,
    jwt: string): Promise<[Error?, any?]> {

    const headers = { Authorization: `Bearer ${jwt}` }

    const url = this.generateDeliveriesUrl(deliveryHash, listingHash)

    const response = await axios.get(url, {
      headers,
      responseType: 'arraybuffer',
    })

    if (response.status !== 200) {
      let message = `Failed to retrieve delivery for hash ${deliveryHash}: `
      message += `${response.status}: ${response.statusText}`
      return [Error(message), undefined]
    }

    return [undefined, response]
  }

  public static generateGetListedUrl(
    fromBlock: number,
    toBlock: number,
    ownerHash?: string): string {

    return DatatrustModule.generateDatatrustEndPoint(true, fromBlock, toBlock, ownerHash)
  }

  public static generateGetCandidatesUrl(
    fromBlock: number,
    toBlock: number,
    ownerHash?: string): string {

    return DatatrustModule.generateDatatrustEndPoint(false, fromBlock, toBlock, ownerHash)
  }

  public static generateDatatrustEndPoint(
    isListed: boolean,
    fromBlock: number,
    toBlock: number|string,
    ownerHash?: string): string {

    console.log('Datatrust::generateDatatrustEndPoint')
    const endpoint = isListed ? Paths.ListedsPath : Paths.CandidatesPath

    let queryParam = `?${!!ownerHash ? `owner=${ownerHash}&` : ``}`
    queryParam = `${queryParam}from-block=${fromBlock}&to-block=${toBlock}`


    return `${Servers.Datatrust}${endpoint}${queryParam}`
  }

  public static generateDeliveriesUrl(deliveryHash: string, listingHash: string) {
    console.log('Datatrust::generateDeliveriesUrl')
    return `${Servers.Datatrust}${Paths.DeliveriesPath}?delivery_hash=${deliveryHash}&query=${listingHash}`
  }

  public static generateDeliveryHash(listingHash: string, store: Store<any>) {
    const appModule = getModule(AppModule, store)

    const hashedAccount = appModule.web3.utils.keccak256(ethereum.selectedAddress)
    const hashedListingHash = appModule.web3.utils.keccak256(listingHash)
    const hash = appModule.web3.utils.keccak256(`${hashedAccount}${hashedListingHash}`)

    return hash.startsWith('0x') ? hash : `0x${hash}`
  }

  public static generatePreviewUrl(listingHash: string) {
    return `${Servers.Datatrust}${Paths.PreviewPath}${listingHash}`
  }

  public static flatten(arrayOfArrays: any[][]): any[] {
    let results: any[] = []
    arrayOfArrays.forEach((ra) => results = results.concat(ra))
    return results
  }
}
