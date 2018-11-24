import { SongNote } from "../models/note";
import { SongChordTemplate } from "../models/sng";
import { SongChord } from "../models/chord";

export interface BendValue {
  Start: number;
  RelativePosition: number;
  Step: number;
}

export enum SlideType {
  None,
  ToNext,
  UnpitchDown,
  UnpitchUp,
}

export class Note {
  private _Start: number = -1;
  public get Start() {return this._Start;}
  private _String: number = -1;
  public get String() {return this._String;}
  private _Fret: number = -1;
  public get Fret() {return this._Fret;}
  private _Duration: number = 0;
  public get Duration() {return this._Duration;}
  private _PalmMute: boolean = false;
  public get IsPalmMute() {return this._PalmMute;}
  private _Harmonic: boolean = false;
  public get IsHarmonic() {return this._Harmonic;}
  private _PullOff: boolean = false;
  public get IsPullOff() {return this._PullOff;}
  private _HammerOn: boolean = false;
  public get IsHammerOn() {return this._HammerOn;}

  public static FromSngNote(sngNote: SongNote): Note {
    const note = new Note();
    note._Start = sngNote.Time ;
    note._String = sngNote.String === 0 ? 0 : sngNote.String || -1;
    note._Fret = sngNote.Fret === 0 ? 0 : sngNote.Fret || -1;
    if (sngNote.Sustain && sngNote.Sustain > 0) {
      note._Duration = sngNote.Sustain;
    }
    if (sngNote.PalmMute && sngNote.PalmMute > 0) {
      note._PalmMute = true;
    }
    if (sngNote.Harmonic && sngNote.Harmonic > 0) {
      note._Harmonic = true;
    }
    if (sngNote.PullOff && sngNote.PullOff > 0) {
      note._PullOff = true;
    }
    if (sngNote.HammerOn && sngNote.HammerOn > 0) {
      note._HammerOn = true;
    }

    return note;
  }


  public static FromSngChord(chord: SongChord, template: SongChordTemplate): Note[] {
    const notes = new Array<Note>();

    if (template.Fret0 !== -1) {
      const newNote = new Note();
      newNote._Fret = template.Fret0;
      newNote._Duration = chord.Sustain;
      newNote._String = 0;
      notes.push(newNote);
    }
    if (template.Fret1 !== -1) {
      const newNote = new Note();
      newNote._Fret = template.Fret1;
      newNote._Duration = chord.Sustain;
      newNote._String = 1;
      notes.push(newNote);
    }
    if (template.Fret2 !== -1) {
      const newNote = new Note();
      newNote._Fret = template.Fret2;
      newNote._Duration = chord.Sustain;
      newNote._String = 2;
      notes.push(newNote);
    }
    if (template.Fret3 !== -1) {
      const newNote = new Note();
      newNote._Fret = template.Fret3;
      newNote._Duration = chord.Sustain;
      newNote._String = 3;
      notes.push(newNote);
    }
    if (template.Fret4 !== -1) {
      const newNote = new Note();
      newNote._Fret = template.Fret4;
      newNote._Duration = chord.Sustain;
      newNote._String = 4;
      notes.push(newNote);
    }
    if (template.Fret5 !== -1) {
      const newNote = new Note();
      newNote._Fret = template.Fret5;
      newNote._Duration = chord.Sustain;
      newNote._String = 5;
      notes.push(newNote);
    }

    return notes;
  }
}