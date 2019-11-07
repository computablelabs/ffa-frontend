<template>
  <section
    class="drawer"
    :class="openClass"
    @close-drawer="closeDrawer"
    @open-drawer="openDrawer">
    <div class="drawer-content">
      <slot />
    </div>
    <a v-if="canClose" @click="closeDrawer" class="delete is-large"></a>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'
import {
  OpenDrawer,
  CloseDrawer,
  DrawerClosed} from '../../models/Events'

import DrawerModule, { DrawerState } from '../../vuexModules/DrawerModule'

import '@/assets/style/ui/drawer.sass'

const openClass = ''

@Component
export default class Drawer extends Vue {

  @Prop({default: false})
  public isOpen?: boolean
  private open: boolean = this.isOpen!
  private canClose = false
  private drawerModule = getModule(DrawerModule, this.$store)
  private unsubscribe!: () => void

  public created() {
    this.unsubscribe = this.$store.subscribe(this.vuexSubscriptions)
  }

  public mounted(this: Drawer) {
    this.$root.$on(OpenDrawer, this.openDrawer)
    this.$root.$on(CloseDrawer, this.closeDrawer)
    console.log('Drawer mounted')
  }

  public beforeDestroy(this: Drawer) {
    this.$root.$off(OpenDrawer, this.openDrawer)
    this.$root.$off(CloseDrawer, this.closeDrawer)
    this.unsubscribe()
    console.log(`Drawer beforeDestroy`)
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
    return this.open ? `${openClass} ${this.drawerModule.drawerOpenClass}` : ''
  }

  private openDrawer() {
    this.open = true
  }

  private closeDrawer() {
    this.open = false
    this.drawerModule.setDrawerState(DrawerState.beforeProcessing)
    this.$root.$emit(DrawerClosed)
  }
}
</script>