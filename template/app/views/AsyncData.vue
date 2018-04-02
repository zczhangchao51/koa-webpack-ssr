<template>
  <div>这里是模拟从服务端同步的一个随机数: {{random}}</div>
</template>
<script>
export default {
  name: 'AsyncData',
  asyncData() {
    return {
      random: Math.random()
    }
  }
}
</script>
