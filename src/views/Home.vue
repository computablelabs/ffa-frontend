<template>
  <!-- scaffolding -->
  <div class="home">
    <h2>LINKS</h2>
    <router-link to="/listings/all">All Listings</router-link>
    <router-link to="/share">Create New Listing</router-link>
    <router-link to="/support">Support</router-link>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { CloseDrawer } from '../models/Events'
import '@/assets/style/components/home.sass'

@Component
export default class Home extends Vue {}
console.log(`Node environment: ${process.env.NODE_ENV}`)
console.log(`Datatrust: ${process.env.VUE_APP_DATATRUST}`)
</script>
