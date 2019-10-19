import axios from 'axios'

import Servers from '../../util/Servers'
import Paths from '../../util/Paths'

export default class CoinbaseModule {

  public static async getEthereumPriceUSD(): Promise<[Error?, number?]> {
    try {
      const url = `${Servers.Coinbase}${Paths.CoinbaseGetExchangeRates}`
      const response = await axios.get(url)

      if (response.status !== 200) {
        return [Error(`Failed to get ethereum price: ${response.status}: ${response.statusText}`), undefined]
      }

      if (!response.data ||
          !response.data.data ||
          !response.data.data.rates ||
          !response.data.data.rates.USD) {
        return [Error(`Improper response format.`), undefined]
      }
      return [undefined, Number(response.data.data.rates.USD)]

    } catch (error) {
      return [Error(error), undefined]
    }
  }
}
