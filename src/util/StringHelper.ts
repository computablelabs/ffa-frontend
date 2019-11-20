export default class StringHelper {
  public static capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
}
