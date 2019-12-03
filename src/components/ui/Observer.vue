<template>
  <div class="observer"></div>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator'

import '@/assets/style/views/listings.sass'

@Component
export default class Observer extends Vue {

  private observer!: IntersectionObserver

  private mounted() {
    const options = {
      root: document.querySelector('#scrollArea'),
      rootMargin: '0px',
      threshold: 1.0,
    }

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting) {
        this.$emit('intersected')
      }
    })

    this.observer.observe(this.$el)
  }
}
</script>