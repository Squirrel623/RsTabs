import { NotesSection, BendData32 } from "../deserializer/sng-importer";
import { NoteMasks } from "../utils/constants";

export interface BendValue {
  Time: number;
  Step: number;
  Unk5: number;
}

export function bendValueFromSng(bendData: ReadonlyArray<BendData32>): BendValue[]|undefined {
  const validBends = bendData.filter(bend => bend.Time > 0 && bend.Step >= 0)
    .map(bend => {return <BendValue>{Time: bend.Time, Step: bend.Step, Unk5: bend.Unk5};});

  return validBends.length > 0 ? validBends : undefined;
}

export class SongNote {
  public Time: number = -1;
  public LinkNext?: number;
  public Accent?: number;
  public Bend?: number;
  public Fret?: number;
  public HammerOn?: number;
  public Harmonic?: number;
  public LeftHand: number = -1;
  public Mute?: number;
  public PalmMute?: number;
  public Pluck: number = -1;
  public PullOff?: number;
  public Slap: number = -1;
  public SlideTo: number = -1;
  public String?: number;
  public Sustain?: number;
  public Tremolo?: number;
  public HarmonicPinch?: number;
  public PickDirection?: number;
  public RightHand: number = -1;
  public SlideUnpitchedTo: number = -1;
  public Tap: number = 0;
  public Vibrato?: number;
  public Ignore?: number;
  public BendValues?: BendValue[];

  public parseNoteMask(mask: number) {
    function checkMaskAndSet(noteMask: NoteMasks): boolean {
      if ((mask & noteMask) !== 0) {
        mask &= ~noteMask;
        return true;
      }
  
      return false;
    }
  
    checkMaskAndSet(NoteMasks.Single);
    checkMaskAndSet(NoteMasks.Open);
    checkMaskAndSet(NoteMasks.LeftHand);
    checkMaskAndSet(NoteMasks.Slide);
    checkMaskAndSet(NoteMasks.Sustain);
    checkMaskAndSet(NoteMasks.SlideUnpitchedTo);
  
    if (checkMaskAndSet(NoteMasks.Parent)) {
      this.LinkNext = 1;
    }
    if (checkMaskAndSet(NoteMasks.Bend)) {
      this.Bend = 1;
    }
    if (checkMaskAndSet(NoteMasks.Pluck)) {
      this.Pluck = 1;
    }
    if (checkMaskAndSet(NoteMasks.Slap)) {
      this.Slap = 1;
    }
    if (checkMaskAndSet(NoteMasks.Tap)) {
      this.Tap = 1;
    }
    if (checkMaskAndSet(NoteMasks.Vibrato)) {
      this.Vibrato = 1;
    }
    if (checkMaskAndSet(NoteMasks.Accent)) {
      this.Accent = 1;
    }
    if (checkMaskAndSet(NoteMasks.HammerOn)) {
      this.HammerOn = 1;
    }
    if (checkMaskAndSet(NoteMasks.PullOff)) {
      this.PullOff = 1;
    }
    if (checkMaskAndSet(NoteMasks.Harmonic)) {
      this.Harmonic = 1;
    }
    if (checkMaskAndSet(NoteMasks.Mute)) {
      this.Mute = 1;
    }
    if (checkMaskAndSet(NoteMasks.PalmMute)) {
      this.PalmMute = 1;
    }
    if (checkMaskAndSet(NoteMasks.Tremolo)) {
      this.Tremolo = 1;
    }
    if (checkMaskAndSet(NoteMasks.PinchHarmonic)) {
      this.HarmonicPinch = 1;
    }
    if (checkMaskAndSet(NoteMasks.RightHand)) {
      this.RightHand = 1;
    }
    if (checkMaskAndSet(NoteMasks.Ignore)) {
      this.Ignore = 1;
    }
  }

  public static ParseSng(notesSection: NotesSection): SongNote[] {
    const notes = new Array<SongNote>();

    for (let i = 0; i < notesSection.Count; i++) {
      const sectionNote = notesSection.Notes[i];
      if (sectionNote.ChordId !== -1) {
        continue;
      }

      const note = new SongNote();
      note.Time = sectionNote.Time;
      note.Fret = sectionNote.FretId;
      note.String = sectionNote.StringIndex;
      note.PickDirection = sectionNote.PickDirection;
      note.parseNoteMask(sectionNote.NoteMask);

      if (sectionNote.LeftHand !== 255) note.LeftHand = sectionNote.LeftHand;
      if (sectionNote.SlideTo !== 255) note.SlideTo = sectionNote.SlideTo;
      if (sectionNote.SlideUnpitchTo !== 255) note.SlideUnpitchedTo = sectionNote.SlideUnpitchTo;
      if (sectionNote.Tap !== 255) note.Tap = sectionNote.Tap;
      if (sectionNote.Pluck !== 255) note.Pluck = sectionNote.Pluck;
      if (sectionNote.Vibrato !== 0) note.Vibrato = sectionNote.Vibrato;
      if (sectionNote.Sustain !== 0) note.Sustain = sectionNote.Sustain;
      if (sectionNote.MaxBend !== 0) note.Bend = sectionNote.MaxBend;
      note.BendValues = bendValueFromSng(sectionNote.BendData.BendData);

      notes.push(note);
    }

    return notes;
  }
}

