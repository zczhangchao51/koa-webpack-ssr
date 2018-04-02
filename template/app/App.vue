<template>
  <div id="app">
    <component :is="layout"></component>
  </div>
</template>
<script>
import Common from '@/layouts/Common'
import Noop from '@/layouts/Noop'
export default {
  name: 'App',
  computed: {
    layout() {
      switch (this.$route.meta.layout) {
        case void 0:
          return Common
        case 'noop':
          return Noop
        default:
          return Common
      }
    }
  }
}
</script>

<style src="assets/css/admin.css"></style>
