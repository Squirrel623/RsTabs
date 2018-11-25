<template>
  <div>
    <input type="file" @change="inputChanged"></input>
    <span>
      <button @click="startPlayer">Start</button>
      <button @click="stopPlayer">Stop</button>
    </span>
    <div>{{strings['0']}}</div>
    <div>{{strings['1']}}</div>
    <div>{{strings['2']}}</div>
    <div>{{strings['3']}}</div>
    <div>{{strings['4']}}</div>
    <div>{{strings['5']}}</div>
  </div>
</template>
<script lang='ts'>
import Vue from 'vue';
import {Player} from './player/player';
import { PSARCBrowser, Track, Note } from '../file-extractor/src';

export default Vue.extend({
  data() {
    return {
      player: null as Player|null,
      strings: {
        '0': '-',
        '1': '-',
        '2': '-',
        '3': '-',
        '4': '-',
        '5': '-',
      }
    };
  },
  mounted(): void {
  },
  methods: {
    notesChangedCallback(notes: ReadonlyArray<Note>): void {
      for (let string in this.strings) {
        //@ts-ignore
        this.strings[string] = '-'
      }
      for (let note of notes) {
        //@ts-ignore
        this.strings[note.String.toString()] = note.Fret;
      }
    },
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
        this.player = new Player(track);
        this.player.setNotesChangedCallback(this.notesChangedCallback.bind(this));
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
#test {
  color: red;
}
</style>
