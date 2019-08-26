<template>
  <div class="tabs">
    <ul>
      <li 
        v-for="tab in tabs"
        :key="tab"
        :class="{'is-active': tab === selectedTab}"
        @click="emitClick(tab)" >
        <a> {{tab}} </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class FfaListingsTabs extends Vue {
  @Prop()
  public tabs!: string[]
  public selectedTab: string = this.tabs[0]

  public emitClick(tab: string) {
    this.selectedTab = tab
    this.$emit('tab-click', tab)
  }
}


</script>
