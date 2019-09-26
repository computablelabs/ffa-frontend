<template>
  <div class="field text-field">
    <div class="control">
       <label
        class="label"
        v-if="showLabel">
        {{label}}
      </label>
      <input
        @focus="onFocus"
        class="input"
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
import FieldValidation from 'interfaces/validation/FieldValidation'

import '@/assets/style/ui/text-field.sass'

@Component
export default class TextField extends Vue {

  @Prop()
  public label!: string

  @Prop()
  public showLabel!: boolean

  @Prop()
  public value!: string

  @Prop()
  public editable!: boolean

  @Prop()
  public classes!: string[]

  @Prop()
  public placeholder!: string

  @Prop()
  public validator!: (title: string) => FieldValidation

  @Prop()
  public onChange!: (title: string) => void

  // should component select all text the first time it gets focus?
  @Prop({default: false})
  public shouldSelectOnFocus?: boolean

  private content = ''
  private internalClasses: string[] = []
  private errorMessage = ''

  // has this component ever been focused?
  private hasReceivedFocus = false

  public mounted(this: TextField) {
    this.content = this.value ? this.value : ''
    this.internalClasses = this.classes ? this.classes : []
  }

  private get disabled(): any {
    // must return false to NOT render the disabled attribute
    // but must return 'disabled' to get the specs to work
    if (this.editable != null) {
      return this.editable ? false : 'disabled'
    }
    return false
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
    this.internalClasses = this.internalClasses.filter((c) => c !== klasse)
  }

  private onFocus(event: any) {
    if (this.shouldSelectOnFocus && !this.hasReceivedFocus) {
      if (event) {
        event.target.select()
        this.hasReceivedFocus = true
      }
    }
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

  @Watch('value')
  private onValueChanged(newValue: string, oldValue: string) {
    this.content = newValue
  }
}
</script>
