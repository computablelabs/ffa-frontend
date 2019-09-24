export default class TokenModule {
  public static weiConverter(wei: number): number {
    return Number((wei / Math.pow(10, 18)).toFixed(2))
  }
}
