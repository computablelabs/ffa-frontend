<template>
  <div class="container">
    <div v-bind:style="styleObject">
      <FileUploader class="is-centered" />
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import StaticFileMetadata from '@/components/ui/StaticFileMetadata.vue'
import FileUploader from '@/components/listing/FileUploader.vue'
import CreateNewListing from '@/views/CreateNewListing.vue'

import FfaListing, { FfaListingStatus } from '../models/FfaListing'

@Component({
  components: {
    CreateNewListing,
    FileUploader
  },
})
export default class TestHarness extends Vue {
  get styleObject(): object {
    return {
      paddingTop: '100px',
      width: '275px',
      marginLeft: 'auto',
      marginRight: 'auto',
    }
  }
}

// @Component({
//   components: {
//     StaticFileMetadata,
//   },
// })
// export default class TestHarness extends Vue {
//   get styleObject(): object {
//     return {
//       marginTop: '200px',
//     }
//   }

//   @Prop({ default:
//     () => {
//       return new FfaListing(
//       'Cat videos all around all around',
//       'This is a description of cat videos',
//       '',
//       '0x1234',
//       '',
//       'MIT',
//       100,
//       '0xdeadbeef',
//       ['tag1', 'tag2'],
//       FfaListingStatus.candidate,
//       12345,
//       0,
//     )},
//   })
//   public ffaListing!: FfaListing
// }
</script>
