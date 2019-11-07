import ServerAddresses from '../models/ServerAddresses'
import { WaitTimes } from '../util/Constants'

export const Config = {
  BlockchainNetwork: ServerAddresses.Skynet,
  BlockchainWaitTime: WaitTimes.SKYNET,
  // TaskPollingTime: 1000 * 60 * 15,
  TaskPollingTime: Number(process.env.VUE_APP_POLLING_TIME),
}
