<template>
  <div class="field">
    <div class="control">
      <input
        class="input file-title"
        type="text"
        v-model="content"
        :class="cssClasses"
        :disabled="disabled"
        :placeholder="placeholder"/>
    </div>
    <p
      class="help is-danger"
      v-if="hasError">
      {{errorMessage}}
    </p>
  </div>
</template>


<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NoCache } from 'vue-class-decorator'

@Component
export default class TextField extends Vue {
  @Prop()
  public value!: string

  @Prop()
  public editable!: boolean

  @Prop()
  public classes!: string[]

  @Prop()
  public placeholder!: string

  @Prop()
  public validator!: Function

  @Prop()
  public onChange!: Function

  private content = ''
  private internalClasses: string[] = []
  private errorMessage = ''

  public mounted(this: TextField) {
    this.content = this.value ? this.value : ''
    this.internalClasses = this.classes ? this.classes : []
  }

  private get disabled(): boolean {
    return this.editable ? !this.editable : false
  }

  private get cssClasses(): string {
    return this.internalClasses ? this.internalClasses.join(' ') : ''
  }

  @NoCache
  private get hasError(): boolean {
    return this.errorMessage != null && this.errorMessage.trim().length > 0
  }

  private addClass(klasse: string) {
    this.internalClasses.push(klasse)
  }

  private removeClass(klasse: string) {
    this.internalClasses = this.internalClasses.filter((c) => c === 'klasse')
  }

  @Watch('content')
  private onContentChanged(newContent: string, oldContent: string) {
    if (this.validator) {
      const validation = this.validator(newContent)
      if (!validation.valid && validation.errorMessage && validation.errorMessage.length > 0) {
        this.errorMessage = validation.errorMessage
        this.addClass('is-danger')
      } else {
        this.errorMessage = ''
        this.removeClass('is-danger')
      }
    }

    if (this.onChange) {
      this.onChange(newContent)
    }
  }
}
</script>
