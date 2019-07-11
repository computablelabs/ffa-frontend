<template>
  <div id="app">
    <nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <img src='http://placekitten.com/100/80'/>
      </div>
      <div class="navbar-menu">
        <div class="navbar-start">
          <div class="navbar-item">
            <router-link to="/">Home</router-link>
          </div>
          <div class="navbar-spacer"> | </div>
          <div class="navbar-item">
            <router-link to="/list">List</router-link>
          </div>
        </div>
        <div class="navbar-end">
        </div>
      </div>
    </nav>
    <div class="view">
      <router-view/>
    </div>
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