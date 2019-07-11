<template>
  <div v-bind:class="[notficationClass, typeClass]">
    <button class="delete" v-on:click="remove"></button>
    {{$props.flash.message}}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import flashes from '../../modules/FlashesModule'
import Flash from '../../models/Flash'

@Component
export default class FlashMessage extends Vue {

  @Prop()
  protected flash!: Flash

  get notficationClass() {
    return 'notification'
  }

  get typeClass() {
    return `is-${this.$props.flash.type}`
  }

  protected remove() {
    const flashesModule = getModule(flashes)
    flashesModule.remove(this.$props.flash.id)
  }

  // public mounted(this: Flash) {
  // }
}
</script>
