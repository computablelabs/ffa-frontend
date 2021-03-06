<template>
  <div class="currency">
    <div
      class="top-row-non-editable"
      v-if="!editable" >
      <span
        class="token-tag"
        :class="secondTokenClass">
        {{ _currencySymbol }}
      </span>
      <span
        class="value"
        v-if="!editable">
        {{ currencyValueString }}
      </span>
    </div>

    <!-- Editable -->
    <div
      class="top-row-editable control has-icons-left"
      v-if="editable">
        <input
          type="text"
          class="input is-large"
          v-model="inputValue"/>
        <span class="icon is-small is-left">
          <div
            class="token-tag"
            :class="secondTokenClass">
            {{ _currencySymbol }}
          </div>
        </span>
    </div>

    <div
      class="bottom-row"
      :class="hideFiatClass">
      ({{ fiatSymbol }} {{ _fiatValueString }})
    </div>
  </div>
</template>

<script lang="ts">
import { NoCache } from 'vue-class-decorator'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Labels } from '../../util/Constants'

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

  public get secondTokenClass(): object {
    const sym = this.currencySymbol
    return (sym === Labels.ETH || sym === Labels.WETH) ? { gray: true } : {}

  }

  public created(this: Currency) {
    const value = this.currencyValue ? this.currencyValue : 0
    const precision = !this.currencyPrecision ? 2 : this.currencyPrecision
    this.inputValue = value.toFixed(precision)
  }

  @Watch('inputValue')
  public onInputValueChanged(newInputValue: string, oldInputValue: string) {
    const regex = /[^0-9.]/gi
    const clean = newInputValue.replace(regex, '')
    this.internalCurrencyValue = Number(clean)

    if (this.onChange) {
      this.onChange(this.internalCurrencyValue)
    }
  }

  @Watch('internalCurrencyValue')
  public onInternalCurrencyValueChange(newValue: number, oldValue: number) {
    this.fiatValueString = newValue.toFixed(2)
  }

  @Watch('currencyValue')
  public onCurrencyValueChanged(newCurrencyValue: number, oldCurrencyValue: number) {
    const precision = !this.currencyPrecision ? 2 : this.currencyPrecision
    this.inputValue = newCurrencyValue.toFixed(precision)
  }
}
</script>
