<template>
  <div class="status">
    <svg width="35px" height="35px" viewBox="0 0 35 35" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <g id="drawer/components/upload-progress" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(-6, 0)">
        
        <!-- Upload icon -->
        <path d="M18,6 C11.3724697,6 6,11.3724697 6,18 C6,24.6275303 11.3724697,30 18,30 C24.6275303,30 30,24.6275303 30,18 C30,11.3724697 24.6275303,6 18,6 Z M12.6145709,17.2603218 C12.7936953,17.0500451 13.1078227,17.0266785 13.3168,17.204507 L17.3704095,20.6676366 L17.3704095,10.5846194 C17.3704095,10.3094431 17.5936688,10.0861839 17.868845,10.0861839 C18.1440213,10.0861839 18.3672805,10.3094431 18.3672805,10.5846194 L18.3672805,20.5506704 L21.7044721,17.2316551 C21.8991743,17.0369529 22.2146042,17.0382522 22.4092931,17.2342503 C22.6039952,17.4289525 22.602696,17.7443824 22.4066979,17.9390712 L18.2191754,22.1030011 C18.1231235,22.199053 17.9946202,22.2483781 17.8674128,22.2483781 C17.7518888,22.2483781 17.637664,22.209437 17.5442073,22.1289597 L12.6688439,17.9650298 C12.4611625,17.7846061 12.4364999,17.4691862 12.6143284,17.2602088 L12.6145709,17.2603218 Z M23.7529422,24.5238557 L11.9865422,24.5238557 C11.711366,24.5238557 11.4881068,24.3005998 11.4881068,24.0254202 C11.4881068,23.750244 11.711366,23.5269847 11.9865422,23.5269847 L23.7529422,23.5269847 C24.0281184,23.5269847 24.2513776,23.750244 24.2513776,24.0254202 C24.2513776,24.3005998 24.0281184,24.5238557 23.7529422,24.5238557 Z" id="Fill-1" fill="#EDEDED" transform="translate(18.000000, 18.000000) scale(1, -1) translate(-18.000000, -18.000000) "></path>

        <!-- Progress bar -->
        <!-- Use stroke dash offset to move progress bar -->
        <circle ref="progress-bar" id="progress-bar" stroke="#FF004B" stroke-width="4" cx="18" cy="18" r="14" :stroke-dashoffset="strokeDashoffset" stroke-dasharray="88" transform="rotate(-90, 18, 18)"></circle>
      </g>
    </svg>
    <div ref="status-label">
      {{ label }}
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import '@/assets/style/ui/status.sass'

@Component

export default class Status extends Vue {
  @Prop({ default: 'status label' })
  public label!: string

  @Prop({ default: 0 })
  private percentComplete!: number

  private get strokeDashoffset(): number {
    return (88 - this.percentComplete * .88)
  }

  private get currentPercentClass(): string {
    return `p${this.percentComplete}`
  }
}
</script>