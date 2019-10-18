import axios from 'axios'

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'

import FfaListing, { FfaListingStatus } from '../../models/FfaListing'

import Servers from '../../util/Servers'
import Paths from '../../util/Paths'
import DatatrustTask from '../../models/DatatrustTask'

interface EtherStats {
  id: string
  name: string
  symbol: string
  rank: string
  price_usd: string
  price_btc: string
  '24h_volume_usd': string
  market_cap_usd: string
  available_supply: string
  total_supply: string
  max_supply: string
  percent_change_1h: string
  percent_change_24h: string
  percent_change_7d: string
  last_updated: string
}

export default class CoinMarketCapModule {

  public static async getEthereumPriceUSD(): Promise<[Error?, number?]> {

    const url = `${Servers.CoinMarketCap}${Paths.CoinMarketCapEth}`
    const response = await axios.get<EtherStats[]>(url)

    if (response.status !== 200) {
      return [Error(`Failed to get ethereum price: ${response.status}: ${response.statusText}`), undefined]
    }

    if (response.data.length === 0) {
      return [Error(`Failed to get ethereum price: No ether stats received`), undefined]
    }

    return [undefined, Number(response.data[0].price_usd)]
  }
}
