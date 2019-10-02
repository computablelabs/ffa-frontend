import axios from 'axios'

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'

import FfaListing, { FfaListingStatus } from '../../models/FfaListing'

import Servers from '../../util/Servers'
import Paths from '../../util/Paths'
import DatatrustTask from '../../models/DatatrustTask'
import DatatrustTaskDetails,
  { DatatrustTaskStatus, FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'

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

interface GetListingsResponse {
  listings: FfaListing[]
  lastBlock: number
}

interface GetTaskResponse {
  message: string
  status: DatatrustTaskStatus
  response: string
}

export default class DatatrustModule {

  public static async getListed(lastBlock: number): Promise<[Error?, FfaListing[]?, number?]> {

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

  public static async getTask(uuid: string, appStore: Store<any>): Promise<[Error?, DatatrustTask?]> {

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

    return [undefined, task]
  }

  public static generateGetListedUrl(lastBlock: number): string {
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
    // queryParam = !!queryParam ? queryParam : ''
    endpoint = (!!queryParam || !!kind) ? endpoint : `${endpoint}/`

    return `${Servers.Datatrust}${endpoint}${kind}${queryParam}`
  }
}
