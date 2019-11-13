import EthereumModule from '../ethereum/EthereumModule'
import JsonWebToken from 'jsonwebtoken'
import Web3 from 'web3'

export default class JwtModule {

  public static expiry(jwt: string): Date {
    const decoded = JsonWebToken.decode(jwt) as { [key: string]: any }
    if (!!!decoded ||
      Object.keys(decoded!).indexOf('exp') < 0 ) {
        return new Date(0)
    }
    return new Date(decoded!.exp * 1000)
  }

  public static hasExpired(jwt: string, date?: Date)  {

    const decoded = JsonWebToken.decode(jwt) as { [key: string]: any }
    if (!!!decoded ||
      Object.keys(decoded!).indexOf('exp') < 0 ) {
        return true
    }
    const d = !!!date ? new Date() : date
    // console.log(`${decoded!.exp * 1000} > ${d.getTime()} ?`)
    return decoded!.exp * 1000 < d.getTime()
  }

  public static getIdentity(jwt: string): string|null {
    const decoded = JsonWebToken.decode(jwt) as { [key: string]: any }
    if (!!!decoded ||
      Object.keys(decoded!).indexOf('identity') < 0 ) {
        return null
    }
    return decoded!.identity
  }

  public static isJwtValid(jwt: string, web3: Web3): boolean {
    const isJwtExpired = JwtModule.hasExpired(jwt)
    const jwtIdentity = JwtModule.getIdentity(jwt)
    const jwtChecksumAddress = !!jwtIdentity ? web3.utils.toChecksumAddress(jwtIdentity!) : ''
    const checksumSelectedAddresses = EthereumModule.ethereumDisabled() ?
      '' : web3.utils.toChecksumAddress(ethereum.selectedAddress)

    return !isJwtExpired && jwtChecksumAddress === checksumSelectedAddresses
  }
}
