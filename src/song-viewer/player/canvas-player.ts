import { Track, Measure, Note, Chord } from '../../file-extractor/src';
import { shallowArraysEqual, flattenArray } from '../../file-extractor/src/utils/utils';


export class CanvasPlayer {
  private playing = false;
  private boundRenderLoop = this.renderLoop.bind(this);

  private track: Track;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;

  private audioCtx: AudioContext = new AudioContext();
  private audioSource?: AudioBuffer;
  private audioBufferSource?: AudioBufferSourceNode;
  
  private trackTimeMs: number = 0;
  private pxPerSec: number = 300;

  private lastLoopStartTimeMs: number = 0;
  private lastTrackStartTimeMs: number = 0;
  private stringYValues: number[] = [];
  private readonly stringColors = ['red', 'yellow', 'blue', 'orange', 'lightgreen', 'purple'];

  constructor(track: Track, canvas: HTMLCanvasElement, audioBuffer: ArrayBuffer) {
    this.track = track;
    this.canvas = canvas;
    this.canvasHeight = canvas.height;
    this.canvasWidth = canvas.width;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('');
    }
    this.ctx = ctx;

    this.trackTimeMs = track.StartTime * 1000;


    this.audioCtx.decodeAudioData(audioBuffer).then((audioBuffer) => {
      this.audioSource = audioBuffer;
    });
  }

  public start() {
    if (this.playing || !this.audioSource) {
      return;
    }
    this.playing = true;

    this.lastLoopStartTimeMs = performance.now();
    this.lastTrackStartTimeMs = this.trackTimeMs;

    this.audioBufferSource = this.audioCtx.createBufferSource();
    this.audioBufferSource.buffer = this.audioSource;
    this.audioBufferSource.connect(this.audioCtx.destination);
    this.audioBufferSource.start(0, this.trackTimeMs/1000);

    this.renderLoop();
  }

  public render() {
    if (this.trackTimeMs > this.track.SongLength * 1000) {
      this.stop();
      return;
    }
    this.resize();

    this.setStringYValues();
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const secondsShown = canvasWidth / this.pxPerSec;
    const endTrackTimeMS = this.trackTimeMs + secondsShown * 1000;

    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const activeMeasures = this.track.Measures.filter((measure) => 
      measure.StartMs < this.trackTimeMs && measure.EndMs > this.trackTimeMs ||
      measure.StartMs >= this.trackTimeMs && measure.EndMs <= endTrackTimeMS ||
      measure.StartMs < endTrackTimeMS && measure.EndMs > endTrackTimeMS ||
      (measure.Notes.find((note) => (note.Start + note.Duration) * 1000 >= this.trackTimeMs) && 
       measure.Notes.find((note) => (note.Start + note.Duration) * 1000 < endTrackTimeMS)));

    if (!activeMeasures.length) {
      return;
    }

    const colors = ['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'];

    let i = 0;
    for (let measure of activeMeasures) {
      this.drawMeasure(measure, colors[i++]);
    }
  }

  private renderLoop() {
    if (!this.playing) {
      return;
    }

    const currentLoopTime = performance.now();
    const elapsedTimeSinceStartMs = currentLoopTime - this.lastLoopStartTimeMs;
    this.trackTimeMs = this.lastTrackStartTimeMs + elapsedTimeSinceStartMs;
    this.render();

    requestAnimationFrame(this.boundRenderLoop);
  }

  private resize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = this.canvasWidth = width;
      this.canvas.height = this.canvasHeight = height;
    }
  }

  private setStringYValues() {
    const height = this.canvas.height;
    const numStrings = 6;
    const spaceBetweenStrings = height / numStrings;

    this.stringYValues = [];
    const startY = spaceBetweenStrings / 2;
    this.stringYValues.push(startY);

    for (let i = 1; i < numStrings; i++) {
      this.stringYValues.push(spaceBetweenStrings * i + startY);
    }
  }

  private drawMeasure(measure: Measure, color: string) {
    const secondsShown = this.canvasWidth / this.pxPerSec;
    const endTrackTimeMS = this.trackTimeMs + secondsShown * 1000;

    //draw box and/or beats
    const startX = this.getCanvasXFromTimeMs(measure.StartMs);
    const endX = this.getCanvasXFromTimeMs(measure.EndMs);

    this.ctx.strokeStyle = color;
    this.ctx.strokeRect(startX, 0, endX - startX, this.canvasHeight);
    //console.log(`drew measure at sx:${startX.toFixed(2)} and ex:${endX.toFixed(2)}`);


    this.ctx.strokeStyle = 'lightgray';
    this.ctx.beginPath();
    for (let beat of measure.BeatTimes) {
      const x = this.getCanvasXFromTimeMs(beat*1000);
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
    }
    this.ctx.stroke();

    //draw chords & notes
    for (let chord of measure.Chords) {
      this.drawChord(chord);
    }
    for (let note of measure.Notes) {
      this.drawNote(note);
    }
  }

  private drawChord(chord: Chord) {
    for (let note of chord.Notes) {
      this.drawNote(note);
    }
  }

  private drawNote(note: Note) {
    const msecondsShown = (this.canvasWidth / this.pxPerSec) * 1000;
    const endTrackTimeMS = this.trackTimeMs + msecondsShown;

    const startX = this.getCanvasXFromTimeMs(note.Start * 1000);
    const endX = this.getCanvasXFromTimeMs((note.Start + note.Duration) * 1000);

    const yVal = this.stringYValues[note.String];
    if (!yVal) {
      throw new Error('');
    }

    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = this.stringColors[note.String];
    if (startX !== endX) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, yVal);
      this.ctx.lineTo(endX, yVal);
      this.ctx.stroke();
    }

    this.ctx.font =  "16px Palantino";
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(note.Fret.toString(), startX, yVal);
  }

  private getCanvasXFromTimeMs(time: number) {
    const secondsShown = this.canvasWidth / this.pxPerSec;

    const startDifference = time - this.trackTimeMs;
    const x = (startDifference / (secondsShown * 1000)) * this.canvasWidth;
    //console.log(`X for time ${time.toFixed(2)} is ${x.toFixed(2)}`);

    return x;
  }

  public stop() {
    if (!this.playing) {
      return;
    }
    this.playing = false;

    if (!this.audioBufferSource) {
      return;
    }

    this.audioBufferSource.stop();
    this.audioBufferSource.disconnect();

  }
}