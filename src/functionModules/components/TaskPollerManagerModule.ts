import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import VotingModule from '../../vuexModules/VotingModule'
import EventModule from '../../vuexModules/EventModule'
import PurchaseModule from '../../vuexModules/PurchaseModule'
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'
import ChallengeModule from '../../vuexModules/ChallengeModule'

import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'

import ContractAddresses from '../../models/ContractAddresses'
import DatatrustTask from '../../models/DatatrustTask'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { SupportStep } from '../../models/SupportStep'
import { WithdrawStep } from '../../models/WithdrawStep'

export default class TaskPollerManagerModule {

  public static async completeTask(task: DatatrustTask, store: Store<any>) {

    const datataskModule = getModule(DatatrustTaskModule, store)
    const ffaListingsModule = getModule(FfaListingsModule, store)
    const votingModule = getModule(VotingModule, store)
    const purchaseModule = getModule(PurchaseModule, store)
    const eventModule = getModule(EventModule, store)
    const supportWithdrawModule = getModule(SupportWithdrawModule, store)
    const challengeModule = getModule(ChallengeModule, store)

    datataskModule.completeTask(task.key)
    let event
    let message = ''

    switch (task.payload.ffaTaskType) {

      case FfaDatatrustTaskType.wrapETH:
        event = EventableModule.createEvent(
          purchaseModule.erc20TokenMinedProcessId, true, undefined)
        return eventModule.append(event)

      case FfaDatatrustTaskType.approveCET:
        event = EventableModule.createEvent(
          purchaseModule.approvalMinedProcessId, true, undefined)
        return eventModule.append(event)


      case FfaDatatrustTaskType.buyListing:
        event = EventableModule.createEvent(
          purchaseModule.purchaseListingMinedProcessId, true, undefined)
        return eventModule.append(event)

      case FfaDatatrustTaskType.createListing:
        return ffaListingsModule.promotePending(
          task.payload.listingHash)

<<<<<<< HEAD
      case FfaDatatrustTaskType.challengeListing:
        event = EventableModule.createEvent(
          challengeModule.challengeMinedProcessId, true, undefined)
        return eventModule.append(event)

=======
>>>>>>> Add PurchaseDrawer component
      case FfaDatatrustTaskType.approveCMT:
        event = EventableModule.createEvent(
          votingModule.approvalMinedProcessId, true, undefined)
        return eventModule.append(event)

      case FfaDatatrustTaskType.voteListing:
        event = EventableModule.createEvent(
          votingModule.votingMinedProcessId, true, undefined)
        return eventModule.append(event)

      case FfaDatatrustTaskType.supportWrapETH:
        message = `Transaction ${supportWithdrawModule.erc20TokenTransactionId} to wrap ether mined.`
        eventModule.append(EventableModule.createEvent('', message, undefined))
        await Promise.all([
          EthereumModule.getEthereumBalance(store),
          EthereumModule.getEtherTokenBalance(store),
          EthereumModule.getContractAllowance(ContractAddresses.ReserveAddress, store),
        ])
        return supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)

      case FfaDatatrustTaskType.supportApproveSpending:
        message = `Transaction ${supportWithdrawModule.approvePaymentTransactionId} to approve spending mined.`
        eventModule.append(EventableModule.createEvent('', message, undefined))
        await Promise.all([
          EthereumModule.getEtherTokenBalance(store),
          EthereumModule.getContractAllowance(ContractAddresses.ReserveAddress, store),
        ])
        return supportWithdrawModule.setSupportStep(SupportStep.Support)

      case FfaDatatrustTaskType.support:
        message = `Transaction ${supportWithdrawModule.supportCollectiveTransactionId} to support mined.`
        eventModule.append(EventableModule.createEvent('', message, undefined))
        await Promise.all([
          EthereumModule.getEthereumBalance(store),
          EthereumModule.getEtherTokenBalance(store),
          EthereumModule.getMarketTokenBalance(store),
          EthereumModule.getContractAllowance(ContractAddresses.ReserveAddress, store),
        ])
        return supportWithdrawModule.setSupportStep(SupportStep.Complete)

      case FfaDatatrustTaskType.collectIncome:
        message = `Transaction ${supportWithdrawModule.supportCollectiveTransactionId} to collect income mined.`
        eventModule.append(EventableModule.createEvent('', message, undefined))
        await EthereumModule.getMarketTokenBalance(store)
        return supportWithdrawModule.removeCollectIncomeTransactionId(task.key)

      case FfaDatatrustTaskType.withdraw:
        message = `Transaction ${supportWithdrawModule.withdrawTransactionId} to withdraw mined.`
        eventModule.append(EventableModule.createEvent('', message, undefined))
        await Promise.all([
          EthereumModule.getMarketTokenBalance(store),
          EthereumModule.getEtherTokenBalance(store),
        ])
        return supportWithdrawModule.setWithdrawStep(WithdrawStep.UnwrapWETH)

      case FfaDatatrustTaskType.unwrapWETH:
        message = `Transaction ${supportWithdrawModule.withdrawTransactionId} to unwrap WETH mined.`
        eventModule.append(EventableModule.createEvent('', message, undefined))
        await Promise.all([
          EthereumModule.getMarketTokenBalance(store),
          EthereumModule.getEtherTokenBalance(store),
          EthereumModule.getEthereumBalance(store),
        ])
        return supportWithdrawModule.setWithdrawStep(WithdrawStep.Complete)
    }
  }

  public static async failTask(task: DatatrustTask, store: Store<any>) {
    const datataskModule = getModule(DatatrustTaskModule, store)
    datataskModule.failTask(task.key)
    // TODO: failure handling?
  }

  public static async createPoller(
    transactionId: string,
    listingHash: string,
    taskType: FfaDatatrustTaskType,
    store: Store<any>) {

    const [error, uuid] = await DatatrustModule.createTask(transactionId)

    if (!!error) { console.log(error) }

    const datatrustTaskDetail = new DatatrustTaskDetails(listingHash, taskType)
    const datatrustTask = new DatatrustTask(uuid!, datatrustTaskDetail)

    const datatrustTaskModule = getModule(DatatrustTaskModule, store)
    datatrustTaskModule.addTask(datatrustTask)
  }
}
