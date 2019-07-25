<template>
  <div class="button-container">
    <button class="button" @click.prevent="startListing">Start Listing</button>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import FlashesModule from '../../modules/FlashesModule'
  import { getModule } from 'vuex-module-decorators'
  import Flash from '../../models/Flash'
  import { FlashType } from '../../models/Flash'

  export default Vue.extend({
    methods: {
      startListing() {
        const flashesModule = getModule(FlashesModule, this.$store)
        const flash = new Flash('Starting Listing', FlashType.info)
        flashesModule.append(flash)
      },
    },
  })
</script>

<style scoped lang='sass'>
.button-container
  display: flex
  justify-content: center

.button
  border-radius: 20px
  margin-top: 30px
  display: flex
  justify-content: flex-end
  background-color: #eee
  border: none

.button:hover
  background-color: #ddd
</style>