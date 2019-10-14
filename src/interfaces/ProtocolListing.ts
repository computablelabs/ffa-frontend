import ListingResult from './ListingResult'
import ListingRaw from './ListingRaw'

export default interface ProtocolListing {
  address: string
  blockNumber: number
  transactionHash: string
  transactionIndex: number
  blockHash: string
  logIndex: number
  removed: boolean
  id: string
  returnValues: ListingResult
  event: string
  signature: string
  raw: ListingRaw
}
