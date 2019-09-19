<template>
  <div class="field ffa-tagger">
    <div class="tile is-parent is-vertical">
      <div class="tile is-parent">
        <div class="tile is-11">
          <div class="control">
            <label
              class="label"
              v-if="showLabel">
              {{label}}
            </label>
            <input
              class="input tag-input"
              type="text"
              v-model="tagInputContent"
              :placeholder="placeholder"
              @keyup.enter="addTags"/>
          </div>
          <p
            class="help is-danger"
            v-if="tagInputHasError">
            {{errorMessage}}
          </p>
        </div>
        <div class="tile is-1 add-container">
          <font-awesome-icon
            class="add-button"
            :icon="['far', 'plus-square']"
            @click="addTags"/>
        </div>
      </div>
      <div class="tile is-12 tag-container">
        <ffaTag
          v-for="tag in tags"
          :tag="tag"
          :key="tag"
          :tagger-key="taggerKey"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { MutationPayload } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import TaggersModule from '../../vuexModules/TaggersModule'
import FfaTag from './FfaTag.vue'
import FfaTaggerModule from '../../../src/functionModules/components/FfaTaggerModule'

import '@/assets/style/ui/tagger.sass'
import { NoCache } from 'vue-class-decorator'
import { Placeholders } from '../../util/Constants'
import UploadModule from '../../vuexModules/UploadModule'

@Component({
  components: {
    FfaTag,
  },
})
export default class FfaTagger extends Vue {

  @Prop()
  public showLabel!: boolean

  // @Prop()
  // public tags!: string[]

  @Prop()
  public taggerKey!: string
  public taggersModule: TaggersModule = getModule(TaggersModule, this.$store)
  public uploadModule: UploadModule = getModule(UploadModule, this.$store)

  private placeholder = Placeholders.ENTER_TAGS
  private tagInputContent = ''
  private tagInputHasError = false

  public mounted(this: FfaTagger) {
    this.$store.subscribe(this.vuexSubscriptions)
  }

  private vuexSubscriptions(mutation: MutationPayload, state: any) {
    switch (mutation.type) {
      case 'taggersModule/addTag':
        this.uploadModule.setTags(this.tags)
        return
      case 'taggersModule/removeTag':
        this.$forceUpdate()
        return
      default:
        return
    }
  }

  @NoCache
  private get tags(): string[] {
    return this.taggersModule.taggers[this.taggerKey]
  }

  private addTags() {
    if (!this.taggerKey) { return }
    FfaTaggerModule.addTags(this.taggersModule, this.taggerKey, this.tagInputContent)
    this.tagInputContent = ''
  }
}
</script>