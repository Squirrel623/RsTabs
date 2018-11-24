import { SongNote, bendValueFromSng } from "./note";
import { Sng2014File, NotesSection, Notes, Chord, ChordNotes, ChordSection } from "../deserializer/sng-importer";
import { NoteMasks } from "../utils/constants";

export class SongChord {
  private _Time = -1
  public get Time() {return this._Time;}
  private _LinkNext = -1;
  public get LinkNext() {return this._LinkNext;}
  private _Accent = -1;
  public get Accent() {return this._Accent;}
  private _ChordId = -1;
  public get ChordId() {return this._ChordId;}
  private _FretHandMute = -1;
  public get FretHandMute() {return this._FretHandMute;}
  private _HighDensity = -1;
  public get HighDensity() {return this._HighDensity;}
  private _Ignore = -1;
  public get Ignore() {return this._Ignore;}
  private _PalmMute = -1;
  public get PalmMute() {return this._PalmMute;}
  private _Strum = '1';
  public get Strum() {return this._Strum;}
  private _Sustain = 0;
  public get Sustain() {return this._Sustain;}
  private _ChordNotes: SongNote[] = [];
  public get ChordNotes(): ReadonlyArray<SongNote> {return this._ChordNotes};

  public parseChordMask(mask: number) {
    function checkMaskAndSet(noteMask: NoteMasks): boolean {
      if ((mask & noteMask) !== 0) {
        mask &= ~noteMask;
        return true;
      }
  
      return false;
    }

    checkMaskAndSet(NoteMasks.Chord);
    checkMaskAndSet(NoteMasks.ChordNotes);
    checkMaskAndSet(NoteMasks.Sustain);
    checkMaskAndSet(NoteMasks.DoubleStop);
    checkMaskAndSet(NoteMasks.Arpeggio);

    this._Strum = 'down';
    if (checkMaskAndSet(NoteMasks.Strum)) {
      this._Strum = 'up';
    }

    if (mask === 0) {
      return;
    }

    if (checkMaskAndSet(NoteMasks.Parent)) {
      this._LinkNext = 1;
    }
    if (checkMaskAndSet(NoteMasks.Accent)) {
      this._Accent = 1;
    }
    if (checkMaskAndSet(NoteMasks.FretHandMute)) {
      this._FretHandMute = 1;
    }
    if (checkMaskAndSet(NoteMasks.HighDensity)) {
      this._HighDensity = 1;
    }
    if (checkMaskAndSet(NoteMasks.Ignore)) {
      this._Ignore = 1;
    }
    if (checkMaskAndSet(NoteMasks.PalmMute)) {
      this._PalmMute = 1;
    }
  }

  public parseChordNotes(template: Chord, chordNotes?: ChordNotes, sustain: number = 0) {
    const notes = new Array<SongNote>();
    const notSetup = -1;

    for (let i = 0; i < 6; i++) {
      if (chordNotes !== undefined && chordNotes.NoteMask[i] !== 0 ||
          chordNotes === undefined && template.Frets[i] !== 255) {
        const cnote = new SongNote();

        cnote.RightHand = cnote.LeftHand = cnote.SlideTo = cnote.SlideUnpitchedTo = notSetup;
        cnote.Tap = 0;
        cnote.Slap = cnote.Pluck = notSetup;

        if (chordNotes !== undefined && chordNotes.NoteMask[i] !== 0) {
          cnote.parseNoteMask(chordNotes.NoteMask[i]);
          cnote.SlideTo = chordNotes.SlideTo[i];
          cnote.SlideUnpitchedTo = chordNotes.SlideUnpitchTo[i];
          cnote.Vibrato = chordNotes.Vibrato[i];
          cnote.Sustain = sustain;
          cnote.BendValues = bendValueFromSng(chordNotes.BendData[i].BendData32);

          if (cnote.BendValues && cnote.BendValues.length > 0) {
            for (let bend of cnote.BendValues) {
              if (cnote.Bend && cnote.Bend < bend.Step) {
                cnote.Bend = bend.Step;
              }
            }
          }
        }

        cnote.Time = this.Time;
        cnote.Fret = template.Frets[i];
        cnote.LeftHand = template.Fingers[i];
        cnote.String = i;

        notes.push(cnote);
      }
    }
  }

  public static ParseSng(sngData: Sng2014File, notesSection: NotesSection): SongChord[] {
    const chords = new Array<SongChord>();

    for (let i = 0; i < notesSection.Count; i++) {
      const note = notesSection.Notes[i];
      if (note.ChordId === -1) {
        continue;
      }

      const chord = new SongChord();
      chord._ChordId = note.ChordId;
      chord._Time = note.Time;
      chord._Sustain = note.Sustain;

      chord.parseChordMask(note.NoteMask);

      const chordNoteId = note.ChordNotesId;
      if (chordNoteId !== -1) {
        if (sngData.ChordNotesSection.ChordNotes.length > chordNoteId) {
          chord.parseChordNotes(sngData.ChordSection.Chords[chord.ChordId], sngData.ChordNotesSection.ChordNotes[chordNoteId], note.Sustain);
        }
      }

      chords.push(chord);
    }

    return chords;
  }
}
