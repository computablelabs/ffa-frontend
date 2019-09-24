import Storeable from '../../interfaces/Storeable'

export default class LocalStorageModule {

  public static store(storeable: Storeable) {
    localStorage.setItem(storeable.key, JSON.stringify(storeable.payload))
  }

  public static read(key: string): Storeable|null {
    const jsonString = localStorage.getItem(key)
    if (jsonString === undefined || jsonString === null) {
      return null
    }
    return {
      key,
      payload: JSON.parse(jsonString!),
    }
  }

  public static readAll(): Storeable[] {
    const storeables: Storeable[] = []
    for (let i = 0; i++; i < localStorage.length) {
      const key = localStorage.key(i)
      if (key === null) {
        continue
      }
      const storeable = LocalStorageModule.read(key)
      if (storeable === null) {
        continue
      }
      storeables.push(storeable)
    }
    return storeables
  }

  public static exists(key: string): boolean {
    return localStorage.getItem(key) !== null
  }

  public static delete(key: string) {
    localStorage.removeItem(key)
  }
}
