<template>
  <div id="voting-drawer"
    class="tile is-vertical is-ancestor"
    v-if="canVote">
    <div class="status tile is-hcentered">
      <div class="tile is-8 ">
        <div class="indicator tile is-2">
         icon
        </div>
        <div class="voting-container tile is-vertical">
          <div class="button-container tile">
            <span>{{ vote }}</span>
            <a class="button approve">{{ approve }}</a>
            <a class="button reject">{{ reject }}</a>
          </div>
          <div class="reason-container tile">
            <input type="text"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'
import { getModule } from 'vuex-module-decorators'

import AppModule from '../../vuexModules/AppModule'

import { ProcessStatus, ProcessStatusLabelMap } from '../../models/ProcessStatus'

import FfaProcessModule from '../../interfaces/vuex/FfaProcessModule'

import { Messages, Labels, Errors } from '../../util/Constants'

@Component
export default class VotingProcess extends Vue {

  public vote = Labels.VOTE
  public accept = Labels.ACCEPT
  public reject = Labels.REJECT

  @NoCache
  public get canVote(): boolean {
    const appModule = getModule(AppModule, this.$store)
    return appModule.canVote
  }

  public mounted(this: VotingProcess) {
    console.log('VotingProcess mounted')
  }
}
</script>
