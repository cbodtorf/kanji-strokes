<template>
  <div id="app">
    <h2>Kanji Strokes</h2>

    <my-canvas :refPatterns="refPatterns" style="width: 100%; height: 400px;">
    </my-canvas>
    
    <font size="6">
      <div id="candidateList"> </div>
    </font>
  </div>
</template>

<script>
import MyCanvas from './components/MyCanvas'
// import refPatterns from './refPatterns'

export default {
  name: 'app',
  components: {
    MyCanvas
  },
  computed: {
    refPatterns () { 
      return window.refPatterns
    }
  },

  mounted () {
    // eslint-disable-next-line
    console.log('refPatterns', this.refPatterns)
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.c-controls {
  display: flex;
  justify-content: center;
}
</style>
