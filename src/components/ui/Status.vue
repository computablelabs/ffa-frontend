<template>
  <div class="status">
   <svg width="34px" height="34px" viewBox="0 0 34 34" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <!-- <rect fill="#DD79F8" x="0" y="0" width="34" height="34"></rect> -->
      <g id="drawer/components/upload-progress" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(5, 5)">
        <!-- Upload icon -->
        <path d="M12,0 C5.37246975,0 0,5.37246975 0,12 C0,18.6275303 5.37246975,24 12,24 C18.6275303,24 24,18.6275303 24,12 C24,5.37246975 18.6275303,0 12,0 Z M6.61457093,11.2603218 C6.79369535,11.0500451 7.10782267,11.0266785 7.31680004,11.204507 L11.3704095,14.6676366 L11.3704095,4.58461939 C11.3704095,4.30944314 11.5936688,4.08618392 11.868845,4.08618392 C12.1440213,4.08618392 12.3672805,4.30944314 12.3672805,4.58461939 L12.3672805,14.5506704 L15.7044721,11.2316551 C15.8991743,11.0369529 16.2146042,11.0382522 16.4092931,11.2342503 C16.6039952,11.4289525 16.602696,11.7443824 16.4066979,11.9390712 L12.2191754,16.1030011 C12.1231235,16.199053 11.9946202,16.2483781 11.8674128,16.2483781 C11.7518888,16.2483781 11.637664,16.209437 11.5442073,16.1289597 L6.66884391,11.9650298 C6.46116246,11.7846061 6.43649988,11.4691862 6.61432836,11.2602088 L6.61457093,11.2603218 Z M17.7529422,18.5238557 L5.98654224,18.5238557 C5.71136599,18.5238557 5.48810678,18.3005998 5.48810678,18.0254202 C5.48810678,17.750244 5.71136599,17.5269847 5.98654224,17.5269847 L17.7529422,17.5269847 C18.0281184,17.5269847 18.2513776,17.750244 18.2513776,18.0254202 C18.2513776,18.3005998 18.0281184,18.5238557 17.7529422,18.5238557 Z" id="Fill-1" fill="#EDEDED"></path>

        <!-- Progress bar -->
        <!-- Use stroke dash offset to move progress bar -->
        <circle ref="progress-bar" id="progress-bar" stroke="#FF004B" stroke-width="3" cx="12" cy="12" r="15" :stroke-dashoffset="strokeDashoffset" stroke-dasharray="94" transform="rotate(-90, 12, 12)"></circle>
      </g>
    </svg>
    <div class="status-label" ref="status-label">
      {{ label }}...{{ percentComplete }}% 
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
    // pi * 2 * radius --> circumference
    return (94 - this.percentComplete * .94)
  }

  private get currentPercentClass(): string {
    return `p${this.percentComplete}`
  }
}
</script>