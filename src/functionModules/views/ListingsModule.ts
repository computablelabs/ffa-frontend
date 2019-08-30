import RouterTabMapping from '../../models/RouterTabMapping'
import { FfaListingStatus } from '../../models/FfaListing'
import { Labels } from '../../util/Constants'

export default class ListingsModule {

  public static routerTabMapping(walletAddress?: string): RouterTabMapping[] {

    const userPrefix = !!walletAddress ? `/users/${walletAddress}` : ''
    const allTabRoute = `${userPrefix}/listings/all`
    const candidatesTabRoute = `${userPrefix}/listings/candidates`
    const listedTabRoute = `${userPrefix}/listings/listed`

    const mapping: RouterTabMapping[] = []
    mapping.push({
      route: allTabRoute,
      label: Labels.ALL,
    })
    mapping.push({
      route: candidatesTabRoute,
      label: Labels.CANDIDATES,
    })
    mapping.push({
      route: listedTabRoute,
      label: Labels.LISTED,
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
