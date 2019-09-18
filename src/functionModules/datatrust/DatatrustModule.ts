import axios from 'axios'

import FfaListing, { FfaListingStatus } from '../../models/FfaListing'

import Servers from '../../util/Servers'
import Paths from '../../util/Paths'

interface GetListedResponse {
  listed: FfaListing[]
  lastListedBlock: number
}

interface GetCandidatesResponse {
  items: object[]
  to_block: number
}

export default class DatatrustModule {


  public static async getListed(lastBlock: number): Promise<[Error?, FfaListing[]?, number?]> {

    const url = this.generateGetListedUrl(lastBlock)
    const response = await axios.get<GetListedResponse>(url)

    if (response.status !== 200) {
      return [Error(`Failed to get listed: ${response.status}: ${response.statusText}`), undefined, undefined]
    }

    response.data.listed.forEach((l) => l.status = FfaListingStatus.listed)

    return [undefined, response.data.listed, response.data.lastListedBlock]
  }

  public static async getCandidates(lastBlock?: number): Promise<[Error?, FfaListing[]?, number?]> {

    const url = this.generateGetCandidatesUrl(lastBlock)
    const response = await axios.get<GetCandidatesResponse>(url)

    if (response.status !== 200) {
      return [Error(`Failed to get candidates: ${response.status}: ${response.statusText}`), undefined, undefined]
    }
    const candidates = response.data.items.map((res: any) => (
      new FfaListing(
        res.title,
        res.description,
        res.type,
        res.listing_hash,
        '0xmd5',
        res.license,
        100,
        '0xowner',
        res.tags,
        FfaListingStatus.candidate,
        42,
        23)
    ))

    return [undefined, candidates, response.data.to_block]
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
