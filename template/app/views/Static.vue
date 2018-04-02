<template>
  <div>这是LRU缓存的静态页面，在服务端只进行一次渲染，请查看控制台，默认设置了在生产模式下启用该功能</div>
</template>
<script>
export default {
  name: 'Static',
  created() {
    console.log('在Created生命周期进行了一次渲染')
  }
}
</script>
