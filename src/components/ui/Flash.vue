<template>
  <div v-bind:class="[notficationClass, typeClass]">
    <button class="delete"></button>
    {{$props.message}}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Flash extends Vue {

  @Prop({default: 'warning'})
  protected flashType!: string

  @Prop({default: ''})
  protected message!: string

  get notficationClass() {
    return 'notification'
  }

  get typeClass() {
    return `is-${this.$props.flashType}`
  }

  public mounted(this: Flash) {
  }
}
</script>
