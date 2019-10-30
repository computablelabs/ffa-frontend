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
  lastBlock: number
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

  public static async getListed(lastBlock?: number): Promise<[Error?, FfaListing[]?, number?]> {

    const url = this.generateGetListedUrl(lastBlock)
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
      return [Error(`Failed to get listed: ${response.status}: ${response.statusText}`), undefined, undefined]
    }

    return [undefined, response.data.listings, response.data.lastBlock]
  }

  public static async getCandidates(lastBlock?: number): Promise<[Error?, FfaListing[]?, number?]> {

    const url = this.generateGetCandidatesUrl(lastBlock)

    const response = await axios.get<GetListingsResponse>(url, {
      transformResponse: [(data, headers) => {

        data = JSON.parse(data)

        if (!!!data.items) {
          return data
        }

        data.items.forEach((o: DatatrustItem) => {
          o.status = FfaListingStatus.candidate
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
      return [Error(`Failed to get candidates: ${response.status}: ${response.statusText}`), undefined, undefined]
    }

    return [undefined, response.data.listings, response.data.lastBlock]
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

    if (response.status !== 200) {
      return [Error(`Failed to get task: ${response.status}: ${response.statusText}`), undefined]
    }

    const datatrustTaskModule = getModule(DatatrustTaskModule, appStore)
    const task = datatrustTaskModule.tasks.find((t) => t.key === uuid)

    if (task === undefined) {
      return [new Error('Task not found in vuex module'), undefined]
    }

    task.payload.status = response.data.status

    if (response.data.result) {
      task.payload.transactionHash = response.data.result
    }

    return [undefined, task]
  }

  public static async getDelivery(
    deliveryHash: string,
    listingHash: string,
    jwt: string): Promise<[Error?, any?]> {

    const headers = {
      Authorization: `Bearer ${jwt}`,
    }

    const axiosConfig = {
      headers,
    }

    const data = {
      delivery_hash: deliveryHash,
      query: listingHash,
    }

    const response = await axios.get(
      this.generateDeliveriesUrl(deliveryHash, listingHash),
      axiosConfig)
      

    if (response.status !== 200) {
      let message = `Failed to retrieve delivery for hash ${deliveryHash}: `
      message += `${response.status}: ${response.statusText}`
      return [Error(message), undefined]
    }

    return [undefined, response.data]
  }

  public static generateGetListedUrl(lastBlock?: number): string {
    return this.generateDatatrustEndPoint(true, undefined, lastBlock)
  }

  public static generateGetCandidatesUrl(lastBlock?: number): string {
    return this.generateDatatrustEndPoint(false, 'application', lastBlock)
  }

  public static generateDatatrustEndPoint(
    isListed: boolean,
    type?: string,
    fromBlock?: number,
    ownerHash?: string): string {

    console.log('Datatrust::generateDatatrustEndPoint')
    let endpoint = isListed ? '/listings' : '/candidates'
    const kind = !!type ? `/${type}` : ''
    let queryParam = ''

    if (!!fromBlock && !!ownerHash) {
      queryParam = `?owner=${ownerHash}&from-block=${fromBlock}`
    } else {
      if (!!fromBlock) {
        queryParam = `?from-block=${fromBlock}`
      } else if (!!ownerHash) {
        queryParam = `?owner=${ownerHash}`
      }
    }

    endpoint = (!!queryParam || !!kind) ? endpoint : `${endpoint}/`

    return `${Servers.Datatrust}${endpoint}${kind}${queryParam}`
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
}
