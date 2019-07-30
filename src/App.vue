<template>
  <div id="app">
    <navigation />
    <div class="view">
      <router-view/>
    </div>
    <drawer :isOpen="true">
      <router-view name="drawer" />
    </drawer>
  </div>
</template>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
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
import '@/assets/style/ffa.sass'
export default {}
</script>
