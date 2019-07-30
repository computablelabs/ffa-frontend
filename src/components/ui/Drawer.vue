<template>
  <section
    class="drawer"
    :class="openClass"
    @close-drawer="closeDrawer"
    @open-drawer="openDrawer">
    <slot />
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import {
  FileDropped,
  OpenDrawer,
  CloseDrawer } from '../../models/Events'

import '@/assets/style/ui/drawer.sass'

const openClass = 'open'

@Component
export default class Drawer extends Vue {

  @Prop({default: false})
  public isOpen?: boolean
  private open: boolean = this.isOpen!

  public mounted(this: Drawer) {
    this.$root.$on(FileDropped, this.openDrawer)
    this.$root.$on(OpenDrawer, this.openDrawer)
    this.$root.$on(CloseDrawer, this.closeDrawer)
  }

  public beforeDestroy(this: Drawer) {
    this.$root.$off(FileDropped, this.openDrawer)
    this.$root.$off(OpenDrawer, this.openDrawer)
    this.$root.$off(CloseDrawer, this.closeDrawer)
  }

  private get openClass(): string {
    return this.open ? openClass : ''
  }

  private openDrawer() {
    this.open = true
  }

  private closeDrawer() {
    this.open = false
  }
}
</script>