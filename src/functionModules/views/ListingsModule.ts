import RouterTabMapping from '../../models/RouterTabMapping'
import { FfaListingStatus } from '../../models/FfaListing'
import { Labels } from '../../util/Constants'

export default class ListingsModule {

  public static routerTabMapping(walletAddress?: string): RouterTabMapping[] {

    const mapping: RouterTabMapping[] = []

    // const all = !!walletAddress ? 'userAllListings' : 'allListings'
    const candidates = !!walletAddress ? 'userCandidates' : 'candidatesListings'
    const listed = !!walletAddress ? 'userListed' : 'listedListings'

    // mapping.push({
    //   route: {
    //     name: all,
    //     params: {
    //       walletAddress,
    //     },
    // },
    //   label: Labels.ALL,
    // })

    mapping.push({
      route: {
        name: listed,
        params: {
          walletAddress,
        },
      },
      label: Labels.LISTED,
    })

    mapping.push({
      route: {
        name: candidates,
        params: {
          walletAddress,
        },
      },
      label: Labels.CANDIDATES,
    })
    return mapping
  }

  public static selectedTab(routerTabMapping: RouterTabMapping[], status?: FfaListingStatus): string {
    if (routerTabMapping.length === 0) { return '' }
    if (!status) { return Labels.ALL }

    switch (status) {
      case FfaListingStatus.candidate:
        return Labels.CANDIDATES
      case FfaListingStatus.listed:
        return Labels.LISTED
      default:
        return Labels.ALL
    }
  }
}
