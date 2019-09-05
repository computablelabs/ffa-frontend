<template>
  <div>
    <SubwayItem :isIconTop="true">Hello World!</SubwayItem>
    <SubwayItem :isIconTop="true">Hello World!</SubwayItem>
    <SubwayItem :isIconTop="true">Hello World!</SubwayItem>
    <VotingDetails />
</div>

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import VotingDetails from './VotingDetails.vue'
import SubwayItem from './SubwayItem.vue'

@Component({
  components: {
    VotingDetails,
    SubwayItem,
  },
})
export default class VerticalSubway extends Vue {}
</script>
