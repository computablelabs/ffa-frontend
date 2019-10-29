<template>
  <div class="subway-item-container">
    <div v-if="!isIconTop" class="line"></div>
    <div class="item">
      <slot></slot>
    </div>
    <div v-if="isIconTop" class="line"></div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import '@/assets/style/ui/subway-item.sass'

@Component
export default class SubwayItem extends Vue {
  // render the icon then the subway line
  @Prop() private isIconTop!: boolean

  get subwayItemWrapperClass(): string {
    return 'subway-item'.concat(this.classPrepend)
  }

  get subwayItemContainerClass(): string {
    return 'subway-item-container'.concat(this.classPrepend)
  }

  get iconClass(): string {
    return 'subway-icon'.concat(this.classPrepend)
  }

  get classPrepend(): string {
    return this.isIconTop ? '-top' : '-bottom'
  }

}
</script>
