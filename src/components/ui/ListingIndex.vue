<template>
  <table class="table is-striped">
    <ListingIndexHeader /> 
    <tbody>
      <ListingIndexItem 
        v-for="listing in candidates" 
        :listing="listing" 
        :key="listing.title"/>
      <ListingIndexItem 
        v-for="listing in listed" 
        :listing="listing" 
        :key="listing.title"/>
    </tbody>
  </table>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ListingIndexItem from './ListingIndexItem.vue'
import ListingIndexHeader from './ListingIndexHeader.vue'
import { MutationPayload } from 'vuex';
import { getModule } from 'vuex-module-decorators'
import FfaListingsModule from '../../vuexModules/FfaListingsModule';
import FfaListing from '../../models/FfaListing';

const vuexModuleName = 'ffaListingsModule'

@Component({
  components: {
    ListingIndexItem,
    ListingIndexHeader,
  }
})
export default class ListingIndex extends Vue {
  protected candidates: FfaListing[] = []
  protected listed: FfaListing[] = []
  protected ffaListingsModule: FfaListingsModule = getModule(FfaListingsModule, this.$store)

  private created() {
    this.$store.subscribe(this.vuexSubscriptions)
    this.fetchListed()
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch(mutation.type) {
      case `${vuexModuleName}/fetchCandidates`:
        this.updateCandidates()
      case `${vuexModuleName}/fetchListed`:
        this.updateListed()
      default:
        // Nathing
    }
  }

  private async fetchCandidates() {
    await this.ffaListingsModule.fetchCandidates()
  }

  private updateCandidates() {
    this.candidates = this.ffaListingsModule.candidates
  }

  private async fetchListed() {
    await this.ffaListingsModule.fetchListed()
  }

  private updateListed() {
    debugger
    this.listed = this.ffaListingsModule.listed
  }
}
</script>