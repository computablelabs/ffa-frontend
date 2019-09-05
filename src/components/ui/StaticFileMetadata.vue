<template>
  <div class="file-metadata">
    <form>
      <header>
        <span :data-size="fileSize">
        </span>
          Dataset Size: {{ fileSize }}
        <span :data-license="license">
          License: {{ license }}
        </span>
      </header>
      <input
        type="text"
        class="input title"
        readonly
        :value="title">
        <div class="field">
          <div class="control">
            <textarea
              class="textarea file-description"
              readonly
              :value="description">
            </textarea>
          </div>
        </div>
        <StaticFfaTags
          :tags="tags"/>
    </form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import FfaListing from '../../models/FfaListing'

import StaticFfaTags from '@/components/ui/StaticFfaTags.vue'

import '@/assets/style/components/file-metadata.sass'

@Component({
  components: {
    StaticFfaTags,
  },
})
export default class StaticFileMetadata extends Vue {

  @Prop()
  public ffaListing!: FfaListing

  public get license(): string {
    return !!this.ffaListing ? this.ffaListing.license : ''
  }

  public get fileSize(): string {
    return !!this.ffaListing ? this.ffaListing.size : ''
  }

  public get title(): string {
    return !!this.ffaListing ? this.ffaListing.title : ''
  }

  public get description(): string {
    return !!this.ffaListing ? this.ffaListing.description : ''
  }

  public get tags(): string[] {
    return !!this.ffaListing ? this.ffaListing.tags : []
  }
}
</script>
