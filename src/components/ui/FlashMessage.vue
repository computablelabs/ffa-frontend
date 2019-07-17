<template>
  <div class="notification"
    v-bind:class="[typeClass]">
    <button class="delete" v-on:click="remove"></button>
    {{ message }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { getModule } from 'vuex-module-decorators'
import flashes from '../../modules/FlashesModule'
import Flash from '../../models/Flash'

@Component
export default class FlashMessage extends Vue {

  @Prop()
  protected flash!: Flash

  @NoCache
  get typeClass() {
    if (!this.flash) {
      return ''
    }
    return `is-${this.flash.type}`
  }

  @NoCache
  get message() {
    if (!this.flash) {
      return ''
    }
    return this.flash.message
  }

  protected remove() {
    const flashesModule = getModule(flashes)
    flashesModule.remove(this.$props.flash.id)
  }
}
</script>
