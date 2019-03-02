<template>
  <div id="app">
    <router-view :style="{height: windowHeight + 'px'}"></router-view>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        windowHeight: document.documentElement.clientHeight
      }
    },
    mounted () {
      window.addEventListener('resize', this.changeSize)
    },
    methods: {
      changeSize () {
        this.windowHeight = document.documentElement.clientHeight
      }
    }
  }
</script>

<style>
  #app {
    height: 100%;
    width: 100%;
    min-width: 1200px;
  }
</style>
