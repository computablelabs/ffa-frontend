<template>
  <div class="drawer-blockchain-step">

    <DrawerMessage
      v-if="showUpcoming"
      class="upcoming padded">
      <div 
        slot="messageSlot" 
        :class="this.useDarkIcons ? 'icon-ethereum-step-dark' : 'icon-ethereum-step'"
        class="drawer-message" >
        {{ label }}
      </div>
    </DrawerMessage>

    <ProcessButton
      v-if="showReady"
      :buttonText="label"
      :clickable="true"
      :processing="false"
      :noToggle="true"
      :onClickCallback="onButtonClick"
      class="ready padded" />

    <BlockchainExecutingMessage
      v-if="showProcessing"
      class="processing padded">
      <div slot="messageSlot" class="executing-message">
        {{ label }}
      </div>
    </BlockchainExecutingMessage>

    <DrawerMessage
      v-if="showCompleted"
      class="completed padded">
      <div 
        slot="messageSlot" 
        :class="useDarkIcons ? 'icon-check-dark' : 'icon-check-light'"
        class="drawer-message">
        {{ label }}
      </div>
    </DrawerMessage>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import { DrawerBlockchainStepState } from '../../models/DrawerBlockchainStepState'

import { Labels } from '../../util/Constants'

import ProcessButton from '@/components/ui/ProcessButton.vue'
import BlockchainExecutingMessage from '../ui/BlockchainExecutingMessage.vue'
import DrawerMessage from '../ui/DrawerMessage.vue'

import '@/assets/style/ui/drawer-blockchain-step.sass'
import '@/assets/style/ui/drawer.sass'

@Component({
  components: {
    DrawerMessage,
    ProcessButton,
    BlockchainExecutingMessage,
  },
})
export default class DrawerBlockchainStep extends Vue {

  @Prop()
  public state!: DrawerBlockchainStepState

  @Prop({ default: () => { return } })
  public onButtonClick!: () => void

  @Prop({ default: 'a step in the process' })
  public label!: string

  @Prop({ default: true })
  public useDarkIcons!: boolean

  public get showUpcoming() {
    return this.state === DrawerBlockchainStepState.upcoming
  }

  public get showReady() {
    return this.state === DrawerBlockchainStepState.ready
  }

  public get showProcessing() {
    return this.state === DrawerBlockchainStepState.processing
  }

  public get showCompleted() {
    return this.state === DrawerBlockchainStepState.completed
  }
}
</script>