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
  PUBLIC_KEY_EMPTY: 'Address cannot be empty',
  TITLE_EMPTY: 'Title cannot be empty',
  WEB3_UNINITIALIZED: 'web3 hasn\'t been initialized',
  HOC_AT_FAILED: 'Failed to initialize HOC',
  INVALID_LISTING_HASH: 'Invalid listing hash',
  UNKNOWN_ERROR: 'Unknown error',
  ERROR_RESOLVING_APPLICATION: 'Error resolving application',
  ERROR_RESOLVING_CHALLENGE: 'Error resolving challenge',
  USER_DENIED_SIGNATURE: 'User denied transaction signature',
}

export const Labels = {
  START_LISTING: 'Starting Listing',
  DROP_A_FILE: 'Drag a file to start',
  ALL: 'All',
  CANDIDATES: 'Candidates',
  LISTED: 'Listed',
  PURCHASE: 'Purchase',
  CHALLENGE: 'Challenge',
  DOWNLOAD: 'Download',
  WRAP_ETH: 'Wrap ETH',
  APPROVE_SPENDING: 'Approve Spending',
  ALLOW_STAKING: 'Allow Staking',
  CHALLENGE_LISTING: 'Challenge Listing',
  BUY_LISTING: 'Buy Listing',
  YOUR_TOKENS: 'Your Tokens',
  CMT: 'CMT',
  USD: 'USD',
  ETH: 'ETH',
  WETH: 'WETH',
  SUPPORT_COOPERATIVE: 'Support Cooperative',
  START_SUPPORT: 'Start Support',
  COLLECT_INCOME: 'Collect income from Listings',
  WITHDRAW_FROM_COOPERATIVE: 'Withdraw from Cooperative',
  START_WITHDRAWAL: 'Start Withdrawal',
  UNWRAP_WETH: 'Unwrap WETH',
  LISTING: 'Listing',
  DETAILS: 'Details',
  FILE_UPLOADED: 'File Uploaded',
  SUBMITTED_TO_COORPERATIVE: 'Submitted To Cooperative',
  VOTING_STARTED: 'Voting started',
  VOTING_ENDED: 'Voting ended',
  VOTING_BY_COMMUNITY_CLOSED: 'Voting by community closed',
  VOTING_DETAILS: 'Vote: Should this candidate be listed in the cooperative?',
  LISTING_WAS_CHALLENGED: 'Listing was challenged',
  COMMNUNITY_REQUIRES: 'Cooperative requires',
  ACCEPT_VOTES_TO_LIST: 'yes votes to list',
  VOTING_LOCKS_UP: 'Voting locks up',
  VOTING_CLOSES: 'Voting closes',
  YOU_HAVE_CAST: 'You have cast',
  VOTE: 'vote',
  MORE: 'more',
  POSSIBLE: 'possible',
  ACCEPT: 'yes',
  REJECT: 'no',
  THIS_IS_A_CANDIDATE: 'This is a candidate listing.',
  VOTING_IS_OPEN: 'Voting is open.',
  RESOLVE: 'CHANGE ME Resolve',
  VOTING_CARD_LISTED: 'The cooperative voted to list this candidate',
  VOTING_CARD_REJECTED: 'The cooperative voted to reject this candidate',
  SUBWAY_LISTED: 'Candidate listed in cooperative',
  SUBWAY_REJECTED: 'Candidate rejected from cooperative',
  OUT_OF: 'out of',
  RESOLVE_APPLICATION: 'Resolve Application',
  RESOLVE_CHALLENGE: 'Resolve Challenge',
}

export const Messages = {
  METAMASK_CONNECTED: 'MetaMask connected',
  UPLOAD: 'Upload',
  UPLOADING: 'Uploading',
  UPLOADED: 'Uploaded',
  LIST: 'Upload and submit',
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
  COMMENT: 'Comment',
}

export const Keys = {
  FILE_METADATA_KEY: 'FileMetadata',
}

export const License = {
  name: 'MIT',
  url: 'https://opensource.org/licenses/MIT',
}

// common to use this for value: in transact opts
export const ZERO_HASHED = '0x0'

export const WaitTimes = {
  TEST: 5,
  SKYNET: 1000 * 15,
}
