import { Note } from "./note";
import { SongChord } from "../models/chord";
import { SongChordTemplate } from "../models/sng";

export class Chord {
  private _ChordId: number = -1;
  public get ChordId() {return this._ChordId;}

  private _ChordName: string = '';
  public get ChordName() {return this._ChordName;}

  private _Duration: number = 0;
  public get Duration() {return this._Duration;}

  private _Notes: Note[] = [];
  public get Notes() {return this._Notes;}

  private _Start: number = -1;
  public get Start() {return this._Start};

  public static FromSngChord(sngChord: SongChord, sngChordTemplates: ReadonlyArray<SongChordTemplate>): Chord {
    const chord = new Chord();
    chord._ChordId = sngChord.ChordId;

    if (!sngChordTemplates[chord.ChordId]) {
      throw new Error('fuck');
    }
    const template = sngChordTemplates[chord.ChordId];

    chord._Start = sngChord.Time;
    chord._Duration = sngChord.Sustain && sngChord.Sustain > 0 ? sngChord.Sustain : 0;
    chord._ChordName = template.ChordName;
    chord._Notes = Note.FromSngChord(sngChord, template);

    return chord;
  }
}

export class ChordTemplate {
  public Name: string = '';
  public Frets: number[] = [];
  public Fingers: number[] = [];
  public ChordId: number = -1;
}
