<template>
  <div class="tabs">
    <ul>
      <li
        v-for="tab in tabs"
        :key="tab"
        @click="$emit('clicked', tab)"
        :class="{'is-active': tab === selected}">
        <a>{{tab}}</a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { MutationPayload } from 'vuex'
import axios from 'axios'

import '@/assets/style/components/voting.sass'

const vuexModuleName = 'newListingModule'
const appVuexModule = 'appModule'
const ffaListingsVuexModule = 'ffaListingsModule'

@Component
export default class FfaCandidateView extends Vue {
  @Prop()
  public tabs!: string[]

  @Prop()
  public selected!: string
}

</script>
