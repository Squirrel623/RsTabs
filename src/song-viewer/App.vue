<template>
  <div id="app">
    <header id="header">Rocksmith DLC Song Viewer</header>
    <div id="track">
      <canvas ref="canvas"></canvas>
    </div>
    <div id="main">
      <input type="file" @change="inputChanged"></input>
      <div>
        <button @click="startPlayer">Start</button>
        <button @click="stopPlayer">Stop</button>
      </div>
    </div>
  </div>
</template>
<script lang='ts'>
import Vue from 'vue';
import {Player} from './player/player';
import { PSARCBrowser, Track, Note } from '../file-extractor/src';
import { CanvasPlayer } from './player/canvas-player';

export default Vue.extend({
  data() {
    return {
      player: null as CanvasPlayer|null,
    };
  },
  mounted(): void {
  },
  methods: {
    inputChanged(event: Event): void {
      if (!event.target) {
        return;
      }
      const input = event.target as HTMLInputElement;
      if (!input.files || !input.files.length) {
        return;
      }

      const file = input.files.item(0);
      if (!file) {
        throw new Error('need file');
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const browser = new PSARCBrowser(reader.result as ArrayBuffer);
        const song = browser.getArrangement('lead');
        const track = new Track(song);
        const audio = browser.getSongAudio();
        if (!audio) {
          throw new Error('');
        }
        this.player = new CanvasPlayer(track, this.$refs.canvas as HTMLCanvasElement, audio);
      }

      reader.readAsArrayBuffer(file);
    },
    startPlayer(): void {
      if (!this.player) {
        return;
      }
      this.player.start();
    },
    stopPlayer(): void {
      if (!this.player) {
        return;
      }
      this.player.stop();
    }
  }
});
</script>
<style lang="scss">
body, html {
  margin: 0px;
  width: 100%;
  height: 100%;
}

#app {
  width: 100%;
  height: 100%;
  display: grid;

  grid-template-columns: 50px auto 50px;
  grid-template-rows: 50px 300px auto;

  @media screen and (max-width: 600px) {
    grid-template-columns: 0px auto 0px;
    grid-template-rows: 50px 300px auto;
  }

  grid-template-areas:
    ". header ."
    ". track  ."
    ". main   .";
}

#header {
  grid-area: header;
}

#track {
  width: 100%;
  height: 100%;

  grid-area: track;
  canvas {
    width: 100%;
    height: 100%;
  }
}

#main {
  grid-area: main;
};


</style>
