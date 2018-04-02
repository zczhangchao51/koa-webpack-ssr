<template>
  <div class="default-namespace">

    <div class="header">
      header
    </div>

    <div class="logo">
      <img src="~assets/img/logo.png" alt="logo">
    </div>

    <ul class="nav">
      <li>
        <router-link :class="{active: $route.path === '/'}" to="/">index</router-link>
      </li>
      <li>
        <router-link active-class="active" to="/asyncdata">asyncdata</router-link>
      </li>
      <li>
        <router-link active-class="active" to="/static">static</router-link>
      </li>
    </ul>

    <div style="min-height: 700px;">
      <!-- <transition name="fade" mode="out-in"> -->
      <router-view class="view"></router-view>
      <!-- </transition> -->
    </div>

  </div>
</template>
<script>
export default {
  name: 'Common'
}
</script>
<style>
.header {
  line-height: 40px;
  text-align: center;
  border-bottom: 1px solid #ccc;
}
.logo {
  width: 200px;
  height: 200px;
  margin: 40px auto;
}
.nav {
  overflow: hidden;
  text-align: center;
}
.nav li {
  list-style: none;
  display: inline-block;
  margin-left: 20px;
  margin-right: 20px;
}
.nav .active {
  color: red;
}
.view {
  text-align: center;
  margin-top: 100px;
}
</style>
