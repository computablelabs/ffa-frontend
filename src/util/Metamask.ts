// import { Errors } from './Constants'

export async function enable(): Promise<string|Error> {
  let result: string

  try {
    const ary = await ethereum.enable()
    result = ary[0]
  } catch (e) {
    result = e
  }

  return result
}
