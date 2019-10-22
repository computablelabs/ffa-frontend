<template>
  <div class="container">
    <div v-bind:style="styleObject">
      <NewListingProcessPresentation 
        :listingStepStatus="listingStepStatus"
        listingStepButtonText="List and Upload"
        :uploadStepStatus="uploadStepStatus"
        uploadStepLabel="Uploading"
        uploadPercentComplete="99"
        :transactionHashIsAssigned="true"
        @listStepClicked="log"
        @uploadStepClicked="log"
      />
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import NewListingProcessPresentation from '../components/listing/NewListingProcessPresentation.vue'

import { ProcessStatus } from '../models/ProcessStatus'

@Component({
  components: {
    NewListingProcessPresentation,
  },
})
export default class TestHarness extends Vue {
  get styleObject(): object {
    return {
      marginTop: '200px',
      backgroundColor: '#5D5D5D',
      padding: '20px',
      color: '#EDEDED',
    }
  }

  protected log() {
    console.log('something happened')
  }

  get listingStepStatus(): ProcessStatus {
    // return ProcessStatus.Complete
    return ProcessStatus.Complete
    // return ProcessStatus.Ready
  }

  get uploadStepStatus(): ProcessStatus {
    // return ProcessStatus.Ready
    return ProcessStatus.Executing
    // return ProcessStatus.Complete
  }
}
</script>
