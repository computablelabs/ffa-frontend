export enum DatatrustTaskStatus {
  started = 'STARTED',
  pending = 'PENDING',
  success = 'SUCCESS',
  failure = 'FAILURE',
}

export enum FfaDatatrustTaskType {
  unknown,
  createListing,
  setDataHash,
  voteApproveSpending,
  approveCET,
  wrapETH,
  voteListing,
  buyListing,
  challengeListing,
  supportWrapETH,
  supportApproveSpending,
  support,
  collectIncome,
  withdraw,
  unwrapWETH,
  resolveChallenge,
  resolveApplication,
  noExecute, // for testing
}

export default class DatatrustTaskDetails {
  public listingHash: string
  public transactionHash!: string
  public status: DatatrustTaskStatus
  public ffaTaskType: FfaDatatrustTaskType
  public created: number
  public resolved!: number

  constructor(listingHash: string, type: FfaDatatrustTaskType) {
    this.listingHash = listingHash
    this.ffaTaskType = type
    this.status = DatatrustTaskStatus.started
    this.created = new Date().getTime()
  }
}
