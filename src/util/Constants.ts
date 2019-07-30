// can't use a ts Enum cuz the numbers don't go up in order (obv).
// NOTE: update as needed...
export const NETWORKS = {
  MAIN_NET: 1,
  MORDEN: 2,
  ROPSTEN: 3,
  RINKEBY: 4,
  KOVAN: 42,
  SKYNET: 29458,
}

export const Errors = {
  METAMAKS_NOT_DETECTED: 'Did not detect MetaMask availability',
  METAMASK_NOT_CONNECTED: 'Could not connect to MetaMask',
  METAMASK_REFUSED: 'User has denied the transaction',
  UPLOAD_FAILED: 'Upload failed',
  LISTING_FAILED: 'Listing failed',
  VOTING_FAILED: 'Voting failed',
}

export const Labels = {
  START_LISTING: 'Starting Listing',
  DROP_A_FILE: 'Drop a file',
}

export const Messages = {
  METAMASK_CONNECTED: 'MetaMask connected',
  UPLOAD: 'Upload',
  UPLOADING: 'Uploading',
  UPLOADED: 'Uploaded',
  LIST: 'List',
  LISTING: 'Listing',
  LISTED: 'Listed',
  VOTE: 'Vote',
  VOTING: 'Voting',
  VOTED: 'Voted',
}

export const Placeholders = {
  TITLE: 'Title',
  DESCRIPTION: 'Description',
  ENTER_TAGS: 'Enter tags',
}
