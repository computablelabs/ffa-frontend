<template>
  <div id="app">
    <h1>{{ foo }}</h1>
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
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import TaskPollerManager from './components/task/TaskPollerManager.vue'

import '@/assets/style/ffa.sass'

@Component({
  components: {
    TaskPollerManager,
  },
})
export default class App extends Vue {

  @Prop()
  private foo!: string

  public async created() {
    console.log('App created')
  }

  public mounted(this: App) {
    console.log('App mounted')
  }
}
</script>
