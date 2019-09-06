<template>
  <div
    class="tile ffa-tag"
    :class="editableClass"
    @click="deleteTag(tag)">

    <button
      type='button'
      class="delete"
      v-if="isEditable">
    </button>
    {{ tag }}
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import TaggersModule from '../../vuexModules/TaggersModule'
import FfaTagModule from '../../../src/functionModules/components/FfaTagModule'

@Component
export default class FfaTag extends Vue {
  @Prop()
  public tag!: string

  @Prop()
  public taggerKey!: string

  @Prop()
  public editable!: boolean

  public get isEditable(): boolean {
    return this.editable === undefined || this.editable === true
  }

  public get editableClass(): string {
    return this.isEditable ? 'editable' : ''
  }

  public deleteTag(tag: string) {
    if (!this.isEditable || !this.taggerKey) {
      return
    }
    const taggersModule = getModule(TaggersModule, this.$store)
    FfaTagModule.deleteTag(taggersModule, this.taggerKey, tag)
  }
}
</script>
