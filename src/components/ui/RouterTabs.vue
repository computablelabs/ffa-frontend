<template>
  <div class="tabs">
    <ul>
      <li
        v-for="tab in tabs"
        :key="tab"
        :class="{'is-active': tab === selected}"
        :data-tab="tab"
        @click="reroute(tab)" >
        <a> {{tab}} </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import RouterTabMapping from '../../models/RouterTabMapping'
import { NoCache } from 'vue-class-decorator'

@Component
export default class RouterTabs extends Vue {

  @NoCache
  private get tabs() {
    if (!this.mapping) {
      return []
    }
    return this.mapping.map((m) => m.label)
  }

  @Prop()
  public mapping!: RouterTabMapping[]

  @Prop()
  public selected!: string

  public reroute(tab: string) {
    if (tab === this.selected) {
      return
    }

    const map = this.mapping.find((m) => m.label === tab)
    if (!map) {
      return
    }

    const resolved = this.$router.resolve(map.route)
    if (resolved.route.name === this.$router.currentRoute.name) {
      return
    }
    console.log(`===> ${resolved.route.name}`)
    this.$router.push(resolved.location)
  }

  private mounted(this: RouterTabs) {
    if (!this.mapping || !this.selected) {
      return
    }
  }
}
</script>
