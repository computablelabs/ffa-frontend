import { Errors } from './Constants'

export async function enable(): Promise<string> {
  let result:string

  try {
    const ary = await ethereum.enable()
    result = ary[0]
  } catch(e) {
    result = Errors.METAMASK_NOT_CONNECTED
  }

  return result
}
