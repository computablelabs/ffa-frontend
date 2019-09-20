<template>
  <div class="voting-interface-wrapper">
    <div class="voting-button-container">
      <font-awesome-icon 
        size="2x"
        class="voting-icon"
        :icon="['fa', 'gavel']" />
      <span>Vote</span>
      <a class="button voting-interface-button">Accept</a>
      <a class="button voting-interface-button">Reject</a>
    </div>
    <textarea 
      :placeholder="placeholder"
      class="comment"></textarea>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Placeholders } from '../../util/Constants'

@Component
export default class VotingInterface extends Vue {
  private placeholder = Placeholders.COMMENT

}
</script>