export default class TokenModule {
  // TODO: REMOVE!  use web3 builtins!
  public static weiConverter(wei: number): number {
    return Number((wei / Math.pow(10, 18)).toFixed(2))
  }
}
