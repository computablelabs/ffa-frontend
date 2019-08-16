import axios from 'axios'

import FfaListing, { FfaListingStatus } from '../../models/FfaListing'

import Servers from '../../util/Servers'
import Paths from '../../util/Paths'

interface GetListingsResponse {
  listings: FfaListing[]
}

interface GetCandidatesResponse {
  candidates: FfaListing[]
}

export default class DatatrustModule {


  public static async getListings(lastBlock: number): Promise<[Error?, FfaListing[]?]> {

    const url = this.generateGetListingsUrl(lastBlock)
    const response = await axios.get<GetListingsResponse>(url)

    if (response.status !== 200) {
      return [Error(`Failed to get listings: ${response.status}: ${response.statusText}`), undefined]
    }

    response.data.listings.forEach((l) => l.status = FfaListingStatus.listed)
    return [undefined, response.data.listings]
  }

  public static async getCandidates(lastBlock: number): Promise<[Error?, FfaListing[]?]> {

    const url = this.generateGetListingsUrl(lastBlock)
    const response = await axios.get<GetCandidatesResponse>(url)

    if (response.status !== 200) {
      return [Error(`Failed to get candidates: ${response.status}: ${response.statusText}`), undefined]
    }

    response.data.candidates.forEach((c) => c.status = FfaListingStatus.candidate)
    return [undefined, response.data.candidates]
  }

  public static generateGetListingsUrl(lastBlock: number): string {
    return this.genererateGetGenericListingUrl(Paths.ListingsPath, lastBlock)
  }

  public static generateGetCandidatesUrl(lastBlock: number): string {
    return this.genererateGetGenericListingUrl(Paths.CandidatesPath, lastBlock)
  }

  public static genererateGetGenericListingUrl(pathPartial: string, lastBlock: number): string {
    let fromBlock = ''
    if (lastBlock > 0) {
      fromBlock = `?from=${lastBlock}`
    }

    return `${Servers.Datatrust}${pathPartial}${fromBlock}`
  }

}
