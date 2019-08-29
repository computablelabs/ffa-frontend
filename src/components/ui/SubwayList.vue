<template>
  <div>
    <SubwayListItem>
    </SubwayListItem>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import SubwayListItem from './SubwayListItem.vue'
import '@/assets/style/views/list.sass'

@Component({
  components: {
    SubwayListItem,
  },
})
export default class SubwayList extends Vue {}
</script>
