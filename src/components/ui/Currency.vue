<template>
  <div class="currency">
    <div class="top-row">
      <div class="token-container">
        <div class="token-tag">
          {{ _currencySymbol }}
        </div>
      </div>
      <div
        class="editor-container"
        v-if="editable">
        <input
          type="text"
          class="currency-editor"
          v-model="inputValue" />
      </div>
      <div
        class="value"
        v-else>
        {{ currencyValueString }}
      </div>
    </div>
    <div class="bottom-row"
      :class="hideFiatClass">
      ({{ fiatSymbol }} {{ _fiatValueString }})
    </div>
  </div>
</template>

<script lang="ts">
import {NoCache} from 'vue-class-decorator'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import '@/assets/style/ui/currency.sass'

/* tslint:disable:variable-name */

@Component
export default class Currency extends Vue {

  @Prop()
  public currencySymbol!: string

  @Prop()
  public currencyValue!: number

  @Prop()
  public currencyPrecision!: number

  @Prop()
  public hideFiat!: boolean

  @Prop()
  public fiatSymbol!: string

  @Prop()
  public fiatRate!: number

  @Prop({default: false})
  public editable!: boolean

  @Prop()
  public onChange!: (newValue: number) => void

  public inputValue: string = ''
  public internalCurrencyValue = 0
  public fiatValueString: string = ''

  public get _currencySymbol(): string {
    return this.currencySymbol
  }

  @NoCache
  public get currencyValueString(): string {
    const precision = !this.currencyPrecision ? 0 : this.currencyPrecision
    return this.internalCurrencyValue ? Number(this.internalCurrencyValue).toFixed(precision) : '0.0'
  }

  @NoCache
  public get hideFiatClass(): string {
    return this.hideFiat ? 'hidden' : ''
  }

  @NoCache
  public get _fiatValueString(): string {
    const rate = this.fiatRate ? this.fiatRate : 0
    return (this.internalCurrencyValue * rate).toFixed(2)
  }

  public created(this: Currency) {
    const value = this.currencyValue ? this.currencyValue : 0
    const precision = !this.currencyPrecision ? 2 : this.currencyPrecision
    this.inputValue = value.toFixed(precision)
  }

  @Watch('inputValue')
  public onInputValueChanged(newInputValue: string, oldInputValue: string) {
    // console.log(`onInputValueChanged: ${oldInputValue} to ${newInputValue}`)
    const regex = /[^0-9.]/gi
    const clean = newInputValue.replace(regex, '')
    this.internalCurrencyValue = Number(clean)

    if (this.onChange) {
      this.onChange(this.internalCurrencyValue)
    }
  }

  @Watch('internalCurrencyValue')
  public onInternalCurrencyValueChange(newValue: number, oldValue: number) {
    // console.log(`onInternalCurrencyValueChange: ${oldValue} to ${newValue}`)
    this.fiatValueString = newValue.toFixed(2)
  }

  @Watch('currencyValue')
  public onCurrencyValueChanged(newCurrencyValue: number, oldCurrencyValue: number) {
    // console.log(`onCurrencyValueChanged: ${oldCurrencyValue} to ${newCurrencyValue}`)
    const precision = !this.currencyPrecision ? 2 : this.currencyPrecision
    this.inputValue = newCurrencyValue.toFixed(precision)
  }
}
</script>
