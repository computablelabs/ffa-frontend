<template>
  <div class="field ffa-tagger">
    <div class="tile is-parent is-vertical">
      <div class="tile is-12 tag-container">
        <ffaTag
          v-for="tag in tags"
          :editable=false
          :tag="tag"
          :key="tag"
          :tagger-key="taggerKey"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import FfaTag from './FfaTag.vue'

import '@/assets/style/ui/tagger.sass'

@Component({
  components: {
    FfaTag,
  },
})
export default class StaticFfaTagger extends Vue {

  @Prop()
  public tags!: string[]

  @Prop()
  public taggerKey!: string

}
</script>