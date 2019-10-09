<template>
  <div class="drawer-message-container">
    <!-- Slot element should be <div> with class that contains background-image for icon -->
    <slot name="messageSlot" />
    <slot name="subMessageSlot" />
  </div>
</template>

<script lang="ts">
import { Vue, Prop } from 'vue-property-decorator'

import '../../assets/style/ui/drawer-message.sass'

export default class DrawerMessage extends Vue {
}
</script>