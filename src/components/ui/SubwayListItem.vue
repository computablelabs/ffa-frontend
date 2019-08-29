<template>
  <div 
    class="subway-item-wrapper"
    :class="subwayDivClass">
    <font-awesome-icon
      size="2x"
      :class="subwayIconClass"
      :icon="['fa', 'dot-circle']" />
    <div class="subway-item-container">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import '@/assets/style/views/list.sass'

const divTopClass = 'subway-item-top'
const divBottomClass = 'subway-item-bottom'
const iconTopClass = 'subway-icon-top'
const iconBottomClass = 'subway-icon-bottom'

@Component
export default class SubwayListItem extends Vue {
  @Prop()
  public iconBottom!: boolean

  get isIconBottom(): boolean {
    return !!this.iconBottom
  }

  get subwayDivClass(): string {
    return this.isIconBottom ? divBottomClass : divTopClass
  }

  get subwayIconClass(): string {
    return this.isIconBottom ? iconBottomClass : iconTopClass
  }
}
</script>
