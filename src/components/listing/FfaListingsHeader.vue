<template>
  <div class="columns listing-header is-vcentered">
    <div class="column">Title</div>
    <div class="column">Description</div>
    <div class="column">File Type</div>
    <div class="column">Listing Hash</div>
    <!-- <div class="column">md5</div> -->
    <div class="column">Tags</div>
    <div class="column">Status</div>
    <!-- <div class="column">Wallet Hash</div> -->
    <!-- <div class="column">License</div> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import '@/assets/style/components/listing.sass'

@Component
export default class FfaListingsHeader extends Vue {

}
</script>

<style scoped>

</style>