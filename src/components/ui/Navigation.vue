<template>
  <nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
      </div>
      <div class="navbar-end is-vcentered">
        <div class="navbar-item share">
          <router-link to="/list">Share</router-link>
        </div>
        <div class="navbar-item browse">
          <router-link to="/">Browse</router-link>
        </div>
        <div class="navbar-item support">
          <router-link to="/">Support</router-link>
        </div>
        <!-- <div class="tile">
          <img class="logo" src="http://placekitten.com/60/60"/>
        </div> -->
        <div>
          <a href="#">Connect</a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

import '@/assets/style/ui/navigation.sass'

@Component
export default class Navigation extends Vue {
  protected setAddress(e: Event) {
    e.preventDefault()
    e.stopPropagation()
  }
}
</script>