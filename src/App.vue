<template>
  <div id="app">
    <navigation />
    <div class="view">
      <router-view />
    </div>
    <drawer :isOpen="false">
      <router-view name="drawer" />
    </drawer>
    <TaskPollerManager />
  </div>
</template>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Route } from 'vue-router'

import TaskPollerManager from './components/task/TaskPollerManager.vue'
import RouterTransitionModule from './functionModules/router/RouterTransitionModule'

import '@/assets/style/ffa.sass'
import '@/assets/style/fonts.css'

@Component({
  components: {
    TaskPollerManager,
  },
})
export default class App extends Vue {

  public async created() {
    console.log('App created')
    this.$router.beforeEach((to: Route, from: Route, next: (val: any) => void) => {
      next(RouterTransitionModule.beforeTransition(to, from, this))
    })
    this.$router.afterEach((to: Route, from: Route) => {
      RouterTransitionModule.afterTransition(to, from, this)
    })
  }

  public mounted(this: App) {
    console.log('App mounted')
  }
}
</script>
