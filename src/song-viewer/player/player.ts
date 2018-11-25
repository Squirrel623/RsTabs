import { Track, Measure, Note, Chord } from '../../file-extractor/src';
import { shallowArraysEqual, flattenArray } from '../../file-extractor/src/utils/utils';


export class Player {
  private track: Track;
  
  private trackTimeMs: number = 0;
  private currentMeasure: Measure;

  private playLoopRegistration: number = 0;
  private lastLoopStartTimeMs: number = 0;
  private lastTrackStartTimeMs: number = 0;

  private activeNotesAndChords: (Note|Chord)[] = [];
  private activeNotes: Note[] = [];

  private notesChangedCallback?: (notes: ReadonlyArray<Note>) => void;

  constructor(track: Track) {
    this.track = track;
    this.trackTimeMs = track.StartTime * 1000;
    this.currentMeasure = track.Measures[0];
  }

  public setNotesChangedCallback(cb: (notes: ReadonlyArray<Note>) => void) {
    this.notesChangedCallback = cb;
  }

  public start() {
    if (this.playLoopRegistration) {
      return;
    }

    this.lastLoopStartTimeMs = performance.now();
    this.lastTrackStartTimeMs = this.trackTimeMs;
    this.playLoopRegistration = setInterval(this.doLoop.bind(this));
  }

  private doLoop() {
    const currentLoopTime = performance.now();
    const elapsedTimeSinceStartMs = currentLoopTime - this.lastLoopStartTimeMs;

    const oldTrackTimeMs = this.trackTimeMs;
    this.trackTimeMs = this.lastTrackStartTimeMs + elapsedTimeSinceStartMs;
  
    if (this.trackTimeMs > this.track.SongLength * 1000) {
      this.stop();
      return;
    }

    const possibleMeasure = this.track.Measures.find((measure) => measure.Start * 1000 <= this.trackTimeMs && measure.End * 1000 > this.trackTimeMs);
    if (!possibleMeasure) {
      console.log(`New TT: ${this.trackTimeMs.toFixed(2)} No Measure`);
      return;
    }
    
    this.currentMeasure = possibleMeasure;

    const newNotes = this.currentMeasure.Notes.filter((note) => {
      return !this.activeNotesAndChords.includes(note) &&
              note.Start * 1000 > oldTrackTimeMs &&
              (note.Start) * 1000 <= this.trackTimeMs;
    });
    const newChords = this.currentMeasure.Chords.filter((chord) => {
      return !this.activeNotesAndChords.includes(chord) &&
              chord.Start * 1000 > oldTrackTimeMs &&
              (chord.Start) * 1000 <= this.trackTimeMs;
    });

    const oldNotesAndChords = this.activeNotesAndChords;
    this.activeNotesAndChords = this.activeNotesAndChords.filter((noteOrChord) => {
      return (noteOrChord.Start + noteOrChord.Duration) * 1000 >= this.trackTimeMs;
    });

    if (shallowArraysEqual(oldNotesAndChords, this.activeNotesAndChords) && newNotes.length === 0 && newChords.length === 0) {
      console.log(`New TT: ${this.trackTimeMs.toFixed(2)} No Update`);
      return;
    }

    console.log('************* ' + this.trackTimeMs.toFixed(2));
    console.log(JSON.stringify(oldNotesAndChords));
    console.log(JSON.stringify(this.activeNotesAndChords));
    console.log(JSON.stringify(newNotes));
    console.log(JSON.stringify(newChords));

    this.activeNotesAndChords = this.activeNotesAndChords.concat(newNotes);
    this.activeNotesAndChords = this.activeNotesAndChords.concat(newChords);

    this.activeNotes = flattenArray(this.activeNotesAndChords.map((noteOrChord) => {
      if (noteOrChord instanceof Note) {
        return noteOrChord;
      }
      return noteOrChord.Notes;
    }));

    if (this.notesChangedCallback) {
      this.notesChangedCallback(this.activeNotes);
    }
  }

  public stop() {
    if (!this.playLoopRegistration) {
      return;
    }

    clearInterval(this.playLoopRegistration);
    this.playLoopRegistration = 0;
  }
}