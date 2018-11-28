import { Note } from "./note";
import { Chord } from "./chord";
import { Song2014 } from "../models/sng";

export class Measure {
  private _Start: number = -1;
  public get Start() {return this._Start;}
  public get StartMs() {return this._Start * 1000;}
  private _End: number = -1;
  public get End() {return this._End;}
  public get EndMs() {return this._End * 1000;}
  private _BeatTimes: number[] = [];
  public get BeatTimes(): ReadonlyArray<number> {return this._BeatTimes};
  private _Notes: Note[] = [];
  public get Notes() {return this._Notes};
  private _Chords: Chord[] = [];
  public get Chords() {return this._Chords;}

  public static FromSng(sngData: Song2014): Measure[] {
    const measures: Measure[] = [];

    let lastMeasureTime = sngData.SongEBeats[0].Time;
    let beatsInMeasure: number[] = [lastMeasureTime];
    for (let i = 1; i < sngData.SongEBeats.length; i++) {
      const sngBeat = sngData.SongEBeats[i];

      if (sngBeat.Measure === -1) {
        beatsInMeasure.push(sngBeat.Time);
        continue;
      }

      const newMeasure = new Measure();
      newMeasure._Start = lastMeasureTime;
      newMeasure._End = sngBeat.Time;
      newMeasure._BeatTimes = beatsInMeasure;
      measures.push(newMeasure);

      lastMeasureTime = sngBeat.Time;
      beatsInMeasure = [lastMeasureTime];
    }

    const lastMeasure = new Measure();
    lastMeasure._Start = lastMeasureTime;
    lastMeasure._End = sngData.SongEBeats[sngData.SongEBeats.length - 1].Time;
    lastMeasure._BeatTimes = beatsInMeasure;
    measures.push(lastMeasure);

    for (let pi of sngData.PhraseIterations) {
      const phrase = sngData.Phrases[pi.PhraseId];
      const level = sngData.Levels[phrase.MaxDifficulty];

      for (let note of level.Notes) {
        if (note.Time < pi.StartTime || note.Time >= pi.EndTime) {
          continue;
        }
        const measure = measures.find((measure) => note.Time >= measure.Start && note.Time < measure.End);
        if (!measure) {
          throw new Error('Missing measure for note');
        }
        measure._Notes.push(Note.FromSngNote(note));
      }
      for (let chord of level.Chords) {
        if (chord.Time < pi.StartTime || chord.Time >= pi.EndTime) {
          continue;
        }
        const measure = measures.find((measure) => chord.Time >= measure.Start && chord.Time < measure.End);
        if (!measure) {
          throw new Error('Missing measure for chord');
        }
        measure._Chords.push(Chord.FromSngChord(chord, sngData.ChordTemplates));
      }
    }

    return measures;
  }
}