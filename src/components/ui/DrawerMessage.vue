<template>
  <div class="status drawer-message tile is-hcentered">
    <div class="tile is-8 ">
      <div class="indicator tile is-2">
        <slot name="iconSlot"/>
      </div>
      <div class="tile is-vertical">
        <div class="label tile">
          <slot name="messageSlot"/>
        </div>
        <div class="label tile">
          <slot name="subMessageSlot"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Prop } from 'vue-property-decorator'

export default class DrawerMessage extends Vue {
}
</script>