<template>
  <div class="notification"
    :class="[typeClass]">
    <button
      class="delete"
      @click="remove"></button>
    {{ message }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { getModule } from 'vuex-module-decorators'
import FlashesModule from '../../vuexModules/FlashesModule'
import Flash from '../../models/Flash'

@Component
export default class FlashMessage extends Vue {

  @Prop()
  protected flash!: Flash

  public mounted(this: FlashMessage) {
    console.log('FlashMessage mounted')
  }

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
    const flashesModule = getModule(FlashesModule)
    flashesModule.remove(this.$props.flash.id)
  }
}
</script>
