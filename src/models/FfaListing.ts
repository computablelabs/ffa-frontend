export enum FfaListingStatus {
  new = 'new',
  candidate = 'candidate',
  listed = 'listed',
  rejected = 'rejected',
}

export enum FfaVote {
  yea,
  nay,
  abstain,
}

export default class FfaListing {
  public title: string
  public description: string
  public type: string
  public hash: string
  public md5: string
  public license: string
  public size: number
  public owner: string
  public tags: string[]
  public status: FfaListingStatus
  public shareDate: number
  public purchaseCount: number
  public userVote = FfaVote.abstain
  public voteBy = 0
  public stake = 0
  public totalYeaVotes = 0
  public totalNayVotes = 0

  constructor(title: string,
              description: string,
              type: string,
              hash: string,
              md5: string,
              license: string,
              size: number,
              owner: string,
              tags: string[],
              status: FfaListingStatus,
              shareDate: number,
              purchaseCount: number) {
    this.title = title
    this.description = description
    this.type = type
    this.hash = hash
    this.md5 = md5
    this.tags = tags
    this.status = status
    this.owner = owner
    this.license = license
    this.size = size
    this.shareDate = shareDate
    this.purchaseCount = purchaseCount
  }
}
