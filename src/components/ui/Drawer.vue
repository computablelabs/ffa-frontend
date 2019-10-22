<template>
  <section
    class="drawer"
    :class="openClass"
    @close-drawer="closeDrawer"
    @open-drawer="openDrawer">
    <slot />
    <a v-if="canClose" @click="closeDrawer" class="delete is-large"></a>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'
import {
  FileDropped,
  OpenDrawer,
  CloseDrawer } from '../../models/Events'

import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'

import '@/assets/style/ui/drawer.sass'

const openClass = 'open'

@Component
export default class Drawer extends Vue {

  @Prop({default: false})
  public isOpen?: boolean
  private open: boolean = this.isOpen!
  private canClose = false
  private drawerModule = getModule(DrawerModule, this.$store)

  public mounted(this: Drawer) {
    this.$root.$on(FileDropped, this.openDrawer)
    this.$root.$on(OpenDrawer, this.openDrawer)
    this.$root.$on(CloseDrawer, this.closeDrawer)
    this.$store.subscribe(this.vuexSubscriptions)
    console.log('Drawer mounted')
  }

  public beforeDestroy(this: Drawer) {
    this.$root.$off(FileDropped, this.openDrawer)
    this.$root.$off(OpenDrawer, this.openDrawer)
    this.$root.$off(CloseDrawer, this.closeDrawer)
  }

  protected async vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case 'drawerModule/setDrawerCanClose':
        this.canClose = mutation.payload
        return
      default:
        return
    }
  }

  private get openClass(): string {
    return this.open ? openClass : ''
  }

  private openDrawer() {
    this.open = true
  }

  private closeDrawer() {
    this.open = false
    this.drawerModule.setDrawerState(DrawerState.beforeProcessing)
  }
}
</script>