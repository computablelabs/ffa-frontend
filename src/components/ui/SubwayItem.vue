<template>
  <div>
    <div 
      class="subway-item-wrapper"
      :class="subwayItemWrapperClass" >
      <font-awesome-icon 
        size="2x"
        :class="iconClass"
        :icon="['fa', 'dot-circle']" />
      <div :class="subwayItemContainerClass">
        <slot></slot>
      </div>
    </div>
</div>

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class SubwayItem extends Vue {
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
