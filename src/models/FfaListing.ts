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
  public fileType: string
  public hash: string
  public md5: string // placeholder
  public license: string
  public size: number // placeholder
  public owner: string // palceholder
  public tags: string[]
  public status: FfaListingStatus // placeholder
  public shareDate: number // placeholder
  public purchaseCount: number // placeholder
  public userVote = FfaVote.abstain
  public voteBy = 0
  public stake = 0
  public totalYeaVotes = 0
  public totalNayVotes = 0

  // Current endpoint payload example
  // description: "asdfasdfasdf"
  // file_type: "application/pdf"
  // license: "MIT"
  // listing_hash: "0x1df7c82b314d6e3b86b773c3d23b48db4fbc7ee56fcdebfa5b04239a18e12386"
  // tags: null
  // title: "10-02-i-a4.pdf"
  constructor(title: string,
              description: string,
              type: string,
              hash: string,
              md5: string, // Placeholder for now
              license: string,
              size: number, // Placeholder
              owner: string, // Placeholder
              tags: string[],
              status: FfaListingStatus,
              shareDate: number, // Placeholder
              purchaseCount: number, // Placeholder
              ) {
    this.title = title
    this.description = description
    this.fileType = type
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
