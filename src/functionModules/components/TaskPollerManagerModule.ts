import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'

import DatatrustTaskModule from '../../vuexModules/DatatrustTaskModule'
import FfaListingsModule from '../../vuexModules/FfaListingsModule'
import VotingModule from '../../vuexModules/VotingModule'
import EventModule from '../../vuexModules/EventModule'
import PurchaseModule from '../../vuexModules/PurchaseModule'
import SupportWithdrawModule from '../../vuexModules/SupportWithdrawModule'
import ChallengeModule from '../../vuexModules/ChallengeModule'
import UploadModule from '../../vuexModules/UploadModule'

import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'
import EventableModule from '../../functionModules/eventable/EventableModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'
import PurchaseProcessModule from '../../functionModules/components/PurchaseProcessModule'
import VotingProcessModule from '../../functionModules/components/VotingProcessModule'
import FileListerModule from './FileListerModule'

import ContractAddresses from '../../models/ContractAddresses'
import DatatrustTask from '../../models/DatatrustTask'
import DatatrustTaskDetails, { FfaDatatrustTaskType } from '../../models/DatatrustTaskDetails'
import { SupportStep } from '../../models/SupportStep'
import { WithdrawStep } from '../../models/WithdrawStep'
import { ProcessStatus } from '../../models/ProcessStatus'
import { VotingActionStep } from '../../models/VotingActionStep'


export default class TaskPollerManagerModule {

  public static async completeTask(task: DatatrustTask, store: Store<any>) {

    const datataskModule = getModule(DatatrustTaskModule, store)
    const ffaListingsModule = getModule(FfaListingsModule, store)
    const votingModule = getModule(VotingModule, store)
    const purchaseModule = getModule(PurchaseModule, store)
    const eventModule = getModule(EventModule, store)
    const supportWithdrawModule = getModule(SupportWithdrawModule, store)
    const challengeModule = getModule(ChallengeModule, store)
    const uploadModule = getModule(UploadModule, store)
    datataskModule.completeTask(task.key)
    let event
    let message = ''

    switch (task.payload.ffaTaskType) {

      //////////////////////////////////////////////////////////////////////
      // Upload
      case FfaDatatrustTaskType.createListing:
        FileListerModule.success(store)
        return ffaListingsModule.promotePending(
          task.payload.listingHash)

      case FfaDatatrustTaskType.setDataHash:
          return uploadModule.setDatatrustStatus(ProcessStatus.Complete)

      //////////////////////////////////////////////////////////////////////
      // Vote
      case FfaDatatrustTaskType.voteApproveSpending:
        votingModule.setVotingStep(VotingActionStep.VotingAction)
        event = EventableModule.createEvent(
          votingModule.approvalTransactionId, true, undefined)
        return eventModule.append(event)

      case FfaDatatrustTaskType.voteListing:
        votingModule.setStatus(ProcessStatus.Ready)

        await Promise.all([
          VotingProcessModule.updateStaked(task.payload.listingHash, store),
          EthereumModule.getMarketTokenBalance(store),
          VotingProcessModule.updateCandidateDetails(task.payload.listingHash, store),
        ])

        votingModule.setVotingStep(VotingActionStep.ApproveSpending)

      case FfaDatatrustTaskType.resolveApplication:
        votingModule.setResolveApplicationStatus(ProcessStatus.Complete)
        event = EventableModule.createEvent(
          votingModule.resolveTransactionId, true, undefined)
        return eventModule.append(event)

      //////////////////////////////////////////////////////////////////////
      // Challenge
      case FfaDatatrustTaskType.challengeApproveSpending:
        challengeModule.setChallengeStep(VotingActionStep.VotingAction)
        event = EventableModule.createEvent(
          votingModule.approvalTransactionId, true, undefined)
        return eventModule.append(event)

      case FfaDatatrustTaskType.challengeListing:

        await Promise.all([
          VotingProcessModule.updateStaked(task.payload.listingHash, store),
          EthereumModule.getMarketTokenBalance(store),
          VotingProcessModule.updateChallenged(task.payload.listingHash, store),
        ])

        challengeModule.setChallengeStep(VotingActionStep.Complete)
        event = EventableModule.createEvent(
          challengeModule.challengeMinedProcessId, true, undefined)
        return eventModule.append(event)

      case FfaDatatrustTaskType.resolveChallenge:

        await Promise.all([
          VotingProcessModule.updateStaked(task.payload.listingHash, store),
          EthereumModule.getMarketTokenBalance(store),
          VotingProcessModule.updateChallenged(task.payload.listingHash, store),
        ])

        votingModule.setResolveApplicationStatus(ProcessStatus.Complete)
        event = EventableModule.createEvent(
          votingModule.resolveChallengeTransactionId, true, undefined)
        return eventModule.append(event)

      //////////////////////////////////////////////////////////////////////
      // Purchase
      case FfaDatatrustTaskType.wrapETH:
        await PurchaseProcessModule.checkEtherTokenBalance(store)
        event = EventableModule.createEvent(
          purchaseModule.erc20TokenMinedProcessId, true, undefined)
        return eventModule.append(event)

      case FfaDatatrustTaskType.approveCET:
        await PurchaseProcessModule.checkDatatrustContractAllowance(store)
        event = EventableModule.createEvent(
          purchaseModule.approvalMinedProcessId, true, undefined)
        return eventModule.append(event)

      case FfaDatatrustTaskType.buyListing:
        event = EventableModule.createEvent(
          purchaseModule.purchaseListingMinedProcessId, true, undefined)
        return eventModule.append(event)

      //////////////////////////////////////////////////////////////////////
      // Support
      case FfaDatatrustTaskType.supportWrapETH:
        message = `Transaction ${supportWithdrawModule.erc20TokenTransactionId} to wrap ether mined.`
        eventModule.append(EventableModule.createEvent('', message, undefined))
        await Promise.all([
          EthereumModule.getEthereumBalance(store),
          EthereumModule.getEtherTokenBalance(store),
          EthereumModule.getEtherTokenContractAllowance(ContractAddresses.ReserveAddress!, store),
        ])
        return supportWithdrawModule.setSupportStep(SupportStep.ApproveSpending)

      case FfaDatatrustTaskType.supportApproveSpending:
        message = `Transaction ${supportWithdrawModule.approvePaymentTransactionId} to approve spending mined.`
        eventModule.append(EventableModule.createEvent('', message, undefined))
        await Promise.all([
          EthereumModule.getEtherTokenBalance(store),
          EthereumModule.getEtherTokenContractAllowance(ContractAddresses.ReserveAddress!, store),
        ])
        return supportWithdrawModule.setSupportStep(SupportStep.Support)

      case FfaDatatrustTaskType.support:
        message = `Transaction ${supportWithdrawModule.supportCollectiveTransactionId} to support mined.`
        eventModule.append(EventableModule.createEvent('', message, undefined))
        await Promise.all([
          EthereumModule.getEthereumBalance(store),
          EthereumModule.getEtherTokenBalance(store),
          EthereumModule.getMarketTokenBalance(store),
          EthereumModule.getEtherTokenContractAllowance(ContractAddresses.ReserveAddress!, store),
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
          EthereumModule.getEtherTokenContractAllowance(ContractAddresses.ReserveAddress!, store),
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
