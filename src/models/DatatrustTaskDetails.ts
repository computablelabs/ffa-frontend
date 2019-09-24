export enum DatatrustTaskStatus {
  created = 'Created',
  completed = 'Completed',
  failed = 'Failed',
}

export enum FfaDatatrustTaskType {
  createListing,
  buyListing,
}

export default class DatatrustTaskDetails {
  public listingHash: string
  public status: DatatrustTaskStatus
  public ffaTaskType: FfaDatatrustTaskType
  public created: number
  public resolved!: number

  constructor(listingHash: string, type: FfaDatatrustTaskType) {
    this.listingHash = listingHash
    this.ffaTaskType = type
    this.status = DatatrustTaskStatus.created
    this.created = new Date().getTime()
  }
}
