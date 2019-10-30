<template>
  <div class="static-file-metadata">
    <div class="icon">
      <img src="@/assets/image/icon/file/large/video.svg" />
    </div>
    <div class="text"> 
      
      <div class="title">
        {{title}}
      </div>
      
      <div class="description">
        {{description}}
      </div>
      
      <div class="bullet-row">
        <div class="bullet-item price">
          {{ costETH }}
        </div>
        <div class="bullet-item size">
          <span data-size="size">
            {{ fileSize }}
          </span>
        </div>
      </div>
      
      <div class="bullet-item create-date">
        Created {{ shareDate }}
      </div>
      
      <div class="bullet-item owner">
        <div class="hex-tag">
          {{ owner }}
        </div>
      </div>
      
      <div class="bullet-item license">
        <span :data-license="license">
          <a href="">{{ license }}</a>
        </span>
      </div>
      
      <div class="bullet-item purchases">
        {{ purchaseCountString }} purchases
      </div>
    
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'

import FfaListing from '../../models/FfaListing'

import AppModule from '../../vuexModules/AppModule'

import StaticFfaTags from '@/components/ui/StaticFfaTags.vue'

import FileHelper from '../../util/FileHelper'

import '@/assets/style/ui/static-file-metadata.sass'

@Component
export default class StaticFileMetadata extends Vue {

  @Prop()
  public ffaListing!: FfaListing

  public get license(): string {
    return !!this.ffaListing ? this.ffaListing.license : ''
  }

  public get fileSize(): string {
    if (!this.ffaListing) { return '' }
    return FileHelper.fileSizeString(this.ffaListing.size)
  }

  public get costETH(): string {
    if (!this.ffaListing) { return '' }
    return FileHelper.costString(this.ffaListing.size, this.appModule.costPerByte)
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

  public get owner(): string {
    return !!this.ffaListing ? this.ffaListing.owner : ''
  }

  public get shareDate(): number {
    return !!this.ffaListing ? this.ffaListing.shareDate : 0
  }

  public get purchaseCountString(): string {
    const count = !!this.ffaListing ? this.ffaListing.purchaseCount : 0
    if (!count || count === 0) {
      return 'No'
    }

    return count.toString()
  }

  public appModule = getModule(AppModule, this.$store)
}
</script>
