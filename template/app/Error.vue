<template>
  <div class="error-namespace">
    <div class="center">
      <div class="img-box">
        <img src="~assets/img/i-404.png">
        <div class="text-center code">{{code}}</div>
      </div>
      <div class="text-center message">{{message}}</div>
      <div class="text-center back-box">
        <router-link to="/" class="back">返回首页</router-link>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Error',
  data() {
    return {
      message: '文件不存在',
      stack: '',
      code: '404'
    }
  },
  mounted() {
    window.vueRenderError = void 0
  }
}
</script>
<style lang="postcss">
.error-namespace {
  .center {
    position: absolute;
    width: 500px;
    height: 300px;
    left: 50%;
    top: 50%;
    margin-top: -150px;
    margin-left: -250px;
  }
  .text-center {
    text-align: center;
  }
  .code {
    font-size: 40px;
    color: white;
    position: absolute;
    top: 40px;
    left: 92px;
  }
  .back-box {
    margin-top: 20px;
  }
  .back {
    text-decoration: underline;
    color: #58b7ff;
    font-size: 14px;
  }
  .message {
    margin-top: 40px;
    font-size: 18px;
    color: #666;
  }
  .img-box {
    position: relative;
    width: 253px;
    height: 199px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
