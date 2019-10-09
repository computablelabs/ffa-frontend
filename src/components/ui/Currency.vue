<template>
  <div class="currency">
    <div class="top-row">
      <div class="pillbox-container">
        <div class="pillbox">
          {{ _currencySymbol }}
        </div>
      </div>
      <div class="value">
        {{ _currencyValue }}
      </div>
    </div>
    <div class="bottom-row"
      :class="hideFiatClass">
      ({{ _fiatSymbol }} {{ _fiatValue }})
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Curency extends Vue {

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
  public fiatValue!: number

  public get _currencySymbol(): string {
    return this.currencySymbol
  }

  public get _currencyValue(): string {
    const precision = !!!this.currencyPrecision ? 0 : this.currencyPrecision
    return !!!this.currencyValue ? '0.00' : this.currencyValue.toFixed(precision)
  }

  public get hideFiatClass(): string {
    return this.hideFiat ? 'hidden' : ''
  }

  public get _fiatSymbol(): string {
    return this.fiatSymbol
  }

  public get _fiatValue(): string {
    return !!!this.fiatValue ? '0.00' : this.fiatValue.toFixed(2)
  }
}
</script>
