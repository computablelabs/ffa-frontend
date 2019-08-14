export enum FfaListingStatus {
  unknown = 'unknown',
  candidate = 'candidate',
  listed = 'listed',
}

export default class FfaListing {
  public title: string
  public description: string
  public type: string
  public hash: string
  public md5: string
  public tags: string[]
  public status: FfaListingStatus

  constructor(title: string,
              description: string,
              type: string,
              hash: string,
              md5: string,
              tags: string[],
              status: FfaListingStatus) {
    this.title = title
    this.description = description
    this.type = type
    this.hash = hash
    this.md5 = md5
    this.tags = tags
    this.status = status
  }
}
