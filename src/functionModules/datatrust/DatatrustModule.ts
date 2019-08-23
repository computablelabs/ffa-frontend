import axios from 'axios'

import FfaListing, { FfaListingStatus } from '../../models/FfaListing'

import Servers from '../../util/Servers'
import Paths from '../../util/Paths'

interface GetListedResponse {
  listed: FfaListing[]
  lastListedBlock: number
}

interface GetCandidatesResponse {
  candidates: FfaListing[]
  lastCandidateBlock: number
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

  public static async getCandidates(lastBlock: number): Promise<[Error?, FfaListing[]?, number?]> {

    const url = this.generateGetListedUrl(lastBlock)
    const response = await axios.get<GetCandidatesResponse>(url)

    if (response.status !== 200) {
      return [Error(`Failed to get candidates: ${response.status}: ${response.statusText}`), undefined]
    }

    response.data.candidates.forEach((c) => c.status = FfaListingStatus.candidate)

    return [undefined, response.data.candidates, response.data.lastCandidateBlock]
  }

  public static generateGetListedUrl(lastBlock: number): string {
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
