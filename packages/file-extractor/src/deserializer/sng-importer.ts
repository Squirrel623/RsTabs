import {Stream} from '../utils/stream';

export class Bpm {
  public readonly Time: number;
  public readonly Measure: number;
  public readonly Beat: number;
  public readonly PhraseIteration: number;
  public readonly Mask: number;

  constructor(stream: Stream) {
    this.Time = stream.readFloat();
    this.Measure = stream.readInt16();
    this.Beat = stream.readInt16();
    this.PhraseIteration = stream.readInt32();
    this.Mask = stream.readInt32();
  }
}

export class BpmSection {
  public readonly Count: number;
  public readonly BPMs: ReadonlyArray<Bpm>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.BPMs = [];
    for (let i = 0; i < this.Count; i++) {
      (this.BPMs as Bpm[]).push(new Bpm(stream));
    }
  }
}

export class Phrase {
  public readonly Solo: number;
  public readonly Disparity: number;
  public readonly Ignore: number;
  public readonly Padding: number;
  public readonly MaxDifficulty: number;
  public readonly PhraseIterationLinks: number;
  public readonly Name: ArrayBuffer;

  constructor(stream: Stream) {
    this.Solo = stream.readByte();
    this.Disparity = stream.readByte();
    this.Ignore = stream.readByte();
    this.Padding = stream.readByte();
    this.MaxDifficulty = stream.readInt32();
    this.PhraseIterationLinks = stream.readInt32();
    this.Name = stream.readBytes(32);
  }
}

export class PhraseSection {
  public readonly Count: number;
  public readonly Phrases: ReadonlyArray<Phrase>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.Phrases = [];
    for (let i = 0; i < this.Count; i++) {
      (this.Phrases as Phrase[]).push(new Phrase(stream));
    }
  }
}

export type SizeSixArray = [number, number, number, number, number, number];
export class Chord {
  public readonly Mask: number;
  public readonly Frets: SizeSixArray;
  public readonly Fingers: SizeSixArray;
  public readonly Notes: SizeSixArray;
  public readonly Name: ArrayBuffer;

  constructor(stream: Stream) {
    this.Mask = stream.readUInt32();
    this.Frets = new Int8Array(stream.readBytes(6)) as any as SizeSixArray;
    this.Fingers = new Int8Array(stream.readBytes(6)) as any as SizeSixArray;
    this.Notes = new Int32Array(stream.readBytes(24)) as any as SizeSixArray;
    this.Name = stream.readBytes(32);
  }
}

export class ChordSection {
  public readonly Count: number;
  public readonly Chords: ReadonlyArray<Chord>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.Chords = [];
    for (let i = 0; i < this.Count; i++) {
      (this.Chords as Chord[]).push(new Chord(stream));
    }
  }
}

export class BendData32 {
  public readonly Time: number;
  public readonly Step: number;
  public readonly Unk3_0: number;
  public readonly Unk4_0: number;
  public readonly Unk5: number;

  constructor(stream: Stream) {
    this.Time = stream.readFloat();
    this.Step = stream.readFloat();
    this.Unk3_0 = stream.readInt16();
    this.Unk4_0 = stream.readByte();
    this.Unk5 = stream.readByte();
  }
}

export class BendData {
  public readonly BendData32: ReadonlyArray<BendData32>;
  public readonly UsedCount: number;

  constructor(stream: Stream) {
    this.BendData32 = [];
    for (let i = 0; i < 32; i++) {
      (this.BendData32 as BendData32[]).push(new BendData32(stream));
    }
    this.UsedCount = stream.readInt32();
  }
}

export class BendDataSection {
  public readonly Count: number;
  public readonly BendData: ReadonlyArray<BendData32>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.BendData = [];
    for (let i = 0; i < this.Count; i++) {
      (this.BendData as BendData32[]).push(new BendData32(stream));
    }
  }
}

export class ChordNotes {
  public readonly NoteMask: SizeSixArray;
  public readonly BendData: [BendData, BendData, BendData, BendData, BendData, BendData];
  public readonly SlideTo: SizeSixArray;
  public readonly SlideUnpitchTo: SizeSixArray;
  public readonly Vibrato: SizeSixArray;

  constructor(stream: Stream) {
    this.NoteMask = new Uint32Array(stream.readBytes(6 * 4)) as any as SizeSixArray;
    this.BendData = [] as any as [BendData, BendData, BendData, BendData, BendData, BendData];
    for (let i = 0; i < 6; i++) {
      this.BendData.push(new BendData(stream));
    }
    this.SlideTo = new Uint8Array(stream.readBytes(6)) as any as SizeSixArray;
    this.SlideUnpitchTo = new Uint8Array(stream.readBytes(6)) as any as SizeSixArray;
    this.Vibrato = new Int16Array(stream.readBytes(6 * 2)) as any as SizeSixArray;
  }
}

export class ChordNotesSection {
  public readonly Count: number;
  public readonly ChordNotes: ReadonlyArray<ChordNotes>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.ChordNotes = [];
    for (let i = 0; i < this.Count; i++) {
      (this.ChordNotes as ChordNotes[]).push(new ChordNotes(stream));
    }
  }
}

export class Vocal {
  public readonly Time: number;
  public readonly Note: number;
  public readonly Length: number;
  public readonly Lyric: ArrayBuffer;

  constructor(stream: Stream) {
    this.Time = stream.readFloat();
    this.Note = stream.readInt32();
    this.Length = stream.readFloat();
    this.Lyric = stream.readBytes(48);
  }
}

export class VocalSection {
  public readonly Count: number;
  public readonly Vocals: ReadonlyArray<Vocal>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.Vocals = [];
    for (let i = 0; i < this.Count; i++) {
      (this.Vocals as Vocal[]).push(new Vocal(stream));
    }
  }
}

export class SymbolsHeader {
  public readonly Unk1: number;
  public readonly Unk2: number;
  public readonly Unk3: number;
  public readonly Unk4: number;
  public readonly Unk5: number;
  public readonly Unk6: number;
  public readonly Unk7: number;
  public readonly Unk8: number;

  constructor(stream: Stream) {
    this.Unk1 = stream.readInt32();
    this.Unk2 = stream.readInt32();
    this.Unk3 = stream.readInt32();
    this.Unk4 = stream.readInt32();
    this.Unk5 = stream.readInt32();
    this.Unk6 = stream.readInt32();
    this.Unk7 = stream.readInt32();
    this.Unk8 = stream.readInt32();
  }
}

export class SymbolsHeaderSection {
  public readonly Count: number;
  public readonly SymbolsHeaders: ReadonlyArray<SymbolsHeader>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.SymbolsHeaders = [];
    for (let i = 0; i < this.Count; i++) {
      (this.SymbolsHeaders as SymbolsHeader[]).push(new SymbolsHeader(stream));
    }
  }
}

export class SymbolsTexture {
  public readonly Font: ArrayBuffer;
  public readonly FontPathLength: number;
  public readonly Unk1_0: number;
  public readonly Width: number;
  public readonly Height: number;

  constructor(stream: Stream) {
    this.Font = stream.readBytes(128);
    this.FontPathLength = stream.readInt32();
    this.Unk1_0 = stream.readInt32();
    this.Width = stream.readInt32();
    this.Height = stream.readInt32();
  }
}

export class SymbolsTextureSection {
  public readonly Count: number;
  public readonly SymbolsTextures: ReadonlyArray<SymbolsTexture>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.SymbolsTextures = [];
    for (let i = 0; i < this.Count; i++) {
      (this.SymbolsTextures as SymbolsTexture[]).push(new SymbolsTexture(stream));
    }
  }
}

export class Rect {
  public readonly yMin: number;
  public readonly xMin: number;
  public readonly yMax: number;
  public readonly xMax: number;

  constructor(stream: Stream) {
    this.yMin = stream.readFloat();
    this.xMin = stream.readFloat();
    this.yMax = stream.readFloat();
    this.xMax = stream.readFloat();
  }
}

export class SymbolDefinition {
  public readonly Text: ArrayBuffer;
  public readonly RectOuter: Rect;
  public readonly RectInner: Rect;

  constructor(stream: Stream) {
    this.Text = stream.readBytes(12);
    this.RectOuter = new Rect(stream);
    this.RectInner = new Rect(stream);
  }
}

export class SymbolDefinitionSection {
  public readonly Count: number;
  public readonly SymbolDefinitions: ReadonlyArray<SymbolDefinition>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.SymbolDefinitions = [];
    for (let i = 0; i < this.Count; i++) {
      (this.SymbolDefinitions as SymbolDefinition[]).push(new SymbolDefinition(stream));
    }
  }
}

export class PhraseIteration {
  public readonly PhraseId: number;
  public readonly StartTime: number;
  public readonly NextPhraseTime: number;
  public readonly Difficulty: [number, number, number];

  constructor(stream: Stream) {
    this.PhraseId = stream.readInt32();
    this.StartTime = stream.readFloat();
    this.NextPhraseTime = stream.readFloat();
    this.Difficulty = [] as any as [number, number, number];
    for (let i = 0; i < 3; i++) {
      this.Difficulty.push(stream.readInt32());
    }
  }
}

export class PhraseIterationSection {
  public readonly Count: number;
  public readonly PhraseIterations: ReadonlyArray<PhraseIteration>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.PhraseIterations = [];
    for (let i = 0; i < this.Count; i++) {
      (this.PhraseIterations as PhraseIteration[]).push(new PhraseIteration(stream));
    }
  }
}

export class PhraseExtraInfoByLevel {
  public readonly PhraseId: number;
  public readonly Difficulty: number;
  public readonly Empty: number;
  public readonly LevelJump: number;
  public readonly Redundant: number;
  public readonly Padding: number;

  constructor(stream: Stream) {
    this.PhraseId = stream.readInt32();
    this.Difficulty = stream.readInt32();
    this.Empty = stream.readInt32();
    this.LevelJump = stream.readByte();
    this.Redundant = stream.readInt16();
    this.Padding = stream.readByte();
  }
}

export class PhraseExtraInfoByLevelSection {
  public readonly Count: number;
  public readonly PhraseExtraInfoByLevel: ReadonlyArray<PhraseExtraInfoByLevel>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.PhraseExtraInfoByLevel = [];
    for (let i = 0; i < this.Count; i++){
      (this.PhraseExtraInfoByLevel as PhraseExtraInfoByLevel[]).push(new PhraseExtraInfoByLevel(stream));
    }
  }
}

export class NLinkedDifficulty {
  public readonly LevelBreak: number;
  public readonly PhraseCount: number;
  public readonly NLDPhrase: ReadonlyArray<number>;

  constructor(stream: Stream) {
    this.LevelBreak = stream.readInt32();
    this.PhraseCount = stream.readInt32();
    this.NLDPhrase = [];
    for (let i = 0; i < this.PhraseCount; i++) {
      (this.NLDPhrase as number[]).push(stream.readInt32());
    }
  }
}

export class NLinkedDifficultySection {
  public readonly Count: number;
  public readonly NLinkedDifficulties: ReadonlyArray<NLinkedDifficulty>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.NLinkedDifficulties = [];
    for (let i = 0; i < this.Count; i++) {
      (this.NLinkedDifficulties as NLinkedDifficulty[]).push(new NLinkedDifficulty(stream));
    }
  }
}

export class Action {
  public readonly Time: number;
  public readonly ActionName: ArrayBuffer;

  constructor(stream: Stream) {
    this.Time = stream.readFloat();
    this.ActionName = stream.readBytes(256);
  }
}

export class ActionSection {
  public readonly Count: number;
  public readonly Actions: ReadonlyArray<Action>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.Actions = [];
    for (let i = 0; i < this.Count; i++) {
      (this.Actions as Action[]).push(new Action(stream));
    }
  }
}

export class Event {
  public readonly Time: number;
  public readonly EventName: ArrayBuffer;

  constructor(stream: Stream) {
    this.Time = stream.readFloat();
    this.EventName = stream.readBytes(256); 
  }
}

export class EventSection {
  public readonly Count: number;
  public readonly Events: ReadonlyArray<Event>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.Events = [];
    for (let i = 0; i < this.Count; i++) {
      (this.Events as Event[]).push(new Event(stream));
    } 
  }
}

export class Tone {
  public readonly Time: number;
  public readonly ToneId: number;

  constructor(stream: Stream) {
    this.Time = stream.readFloat();
    this.ToneId = stream.readInt32();
  }
}

export class ToneSection {
  public readonly Count: number;
  public readonly Tones: ReadonlyArray<Tone>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.Tones = [];
    for (let i = 0; i < this.Count; i++) {
      (this.Tones as Tone[]).push(new Tone(stream));
    } 
  }
}

export class Dna {
  public readonly Time: number;
  public readonly DnaId: number;

  constructor(stream: Stream) {
    this.Time = stream.readFloat();
    this.DnaId = stream.readInt32();
  }
}

export class DnaSection {
  public readonly Count: number;
  public readonly Dnas: ReadonlyArray<Dna>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.Dnas = [];
    for (let i = 0; i < this.Count; i++) {
      (this.Dnas as Dna[]).push(new Dna(stream));
    } 
  }
}

export class Section {
  public readonly Name: ArrayBuffer;
  public readonly Number: number;
  public readonly StartTime: number;
  public readonly EndTime: number;
  public readonly StartPhraseIterationId: number;
  public readonly EndPhraseIterationId: number;
  public readonly StringMask: ArrayBuffer;

  constructor(stream: Stream) {
    this.Name = stream.readBytes(32);
    this.Number = stream.readInt32();
    this.StartTime = stream.readFloat();
    this.EndTime = stream.readFloat();
    this.StartPhraseIterationId = stream.readInt32();
    this.EndPhraseIterationId = stream.readInt32();
    this.StringMask = stream.readBytes(36);
  }
}

export class SectionSection {
  public readonly Count: number;
  public readonly Sections: ReadonlyArray<Section>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.Sections = [];
    for (let i = 0; i < this.Count; i++) {
      (this.Sections as Section[]).push(new Section(stream));
    } 
  }
}

export class Anchor {
  public readonly StartBeatTime: number;
  public readonly EndBeatTime: number;
  public readonly FirstNoteTime: number;
  public readonly LastNoteTime: number;
  public readonly FretId: number;
  public readonly Padding: ArrayBuffer;
  public readonly Width: number;
  public readonly PhraseIterationId: number;

  constructor(stream: Stream) {
    this.StartBeatTime = stream.readFloat();
    this.EndBeatTime = stream.readFloat();
    this.FirstNoteTime = stream.readFloat();
    this.LastNoteTime = stream.readFloat();
    this.FretId = stream.readByte();
    this.Padding = stream.readBytes(3);
    this.Width = stream.readInt32();
    this.PhraseIterationId = stream.readInt32();
  }
}

export class AnchorSection {
  public readonly Count: number;
  public readonly Anchors: ReadonlyArray<Anchor>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.Anchors = [];
    for (let i = 0; i < this.Count; i++) {
      (this.Anchors as Anchor[]).push(new Anchor(stream));
    } 
  }
}

export class AnchorExtension {
  public readonly BeatTime: number;
  public readonly FretId: number;
  public readonly Unk2: number;
  public readonly Unk3: number;
  public readonly Unk4: number;

  constructor(stream: Stream) {
    this.BeatTime = stream.readFloat();
    this.FretId = stream.readByte();
    this.Unk2 = stream.readInt32();
    this.Unk3 = stream.readInt16();
    this.Unk4 = stream.readByte(); 
  }
}

export class AnchorExtensionSection {
  public readonly Count: number;
  public readonly AnchorExtensions: ReadonlyArray<AnchorExtension>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.AnchorExtensions = [];
    for (let i = 0; i < this.Count; i++) {
      (this.AnchorExtensions as AnchorExtension[]).push(new AnchorExtension(stream));
    } 
  }
}

export class Fingerprint {
  public readonly ChordId: number;
  public readonly StartTime: number;
  public readonly EndTime: number;
  public readonly FirstNoteTime: number;
  public readonly LastNoteTime: number;

  constructor(stream: Stream) {
    this.ChordId = stream.readInt32();
    this.StartTime = stream.readFloat();
    this.EndTime = stream.readFloat();
    this.FirstNoteTime = stream.readFloat();
    this.LastNoteTime = stream.readFloat(); 
  }
}

export class FingerprintSection {
  public readonly Count: number;
  public readonly Fingerprints: ReadonlyArray<Fingerprint>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.Fingerprints = [];
    for (let i = 0; i < this.Count; i++) {
      (this.Fingerprints as Fingerprint[]).push(new Fingerprint(stream));
    } 
  }
}

export class Notes {
  public readonly NoteMask: number;
  public readonly NoteFlags: number;
  public readonly Hash: number;
  public readonly Time: number;
  public readonly StringIndex: number;
  public readonly FretId: number;
  public readonly AnchorFretId: number;
  public readonly AnchorWidth: number;
  public readonly ChordId: number;
  public readonly ChordNotesId: number;
  public readonly PhraseId: number;
  public readonly PhraseIterationId: number;
  public readonly FingerprintId: [number, number];
  public readonly NextIterNote: number;
  public readonly PrevIterNote: number;
  public readonly ParentPrevNote: number;
  public readonly SlideTo: number;
  public readonly SlideUnpitchTo: number;
  public readonly LeftHand: number;
  public readonly Tap: number;
  public readonly PickDirection: number;
  public readonly Slap: number;
  public readonly Pluck: number;
  public readonly Vibrato: number;
  public readonly Sustain: number;
  public readonly MaxBend: number;
  public readonly BendData: BendDataSection; 

  constructor(stream: Stream) {
    this.NoteMask = stream.readUInt32();
    this.NoteFlags = stream.readUInt32();
    this.Hash = stream.readUInt32();
    this.Time = stream.readFloat();
    this.StringIndex = stream.readByte();
    this.FretId = stream.readByte();
    this.AnchorFretId = stream.readByte();
    this.AnchorWidth = stream.readByte();
    this.ChordId = stream.readInt32();
    this.ChordNotesId = stream.readInt32();
    this.PhraseId = stream.readInt32();
    this.PhraseIterationId = stream.readInt32();
    this.FingerprintId = [stream.readInt16(), stream.readInt16()];
    this.NextIterNote = stream.readInt16();
    this.PrevIterNote = stream.readInt16();
    this.ParentPrevNote = stream.readInt16();
    this.SlideTo = stream.readByte();
    this.SlideUnpitchTo = stream.readByte();
    this.LeftHand = stream.readByte();
    this.Tap = stream.readByte();
    this.PickDirection = stream.readByte();
    this.Slap = stream.readByte();
    this.Pluck = stream.readByte();
    this.Vibrato = stream.readInt16();
    this.Sustain = stream.readFloat();
    this.MaxBend = stream.readFloat();
    this.BendData = new BendDataSection(stream);
  }
}

export class NotesSection {
  public readonly Count: number;
  public readonly Notes: ReadonlyArray<Notes>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.Notes = [];
    for (let i = 0; i < this.Count; i++) {
      (this.Notes as Notes[]).push(new Notes(stream));
    } 
  }
}

export class Arrangement {
  public readonly Difficulty: number;
  public readonly AnchorSection: AnchorSection;
  public readonly AnchorExtensionSection: AnchorExtensionSection;
  public readonly Fingerprints1: FingerprintSection;
  public readonly Fingerprints2: FingerprintSection;
  public readonly NotesSection: NotesSection;
  public readonly PhraseCount: number;
  public readonly AverageNotesPerIteration: ReadonlyArray<number>;
  public readonly PhraseIterationCount1: number;
  public readonly NotesInIteration1: ReadonlyArray<number>;
  public readonly PhraseIterationCount2: number;
  public readonly NotesInIteration2: ReadonlyArray<number>;

  constructor(stream: Stream) {
    this.Difficulty = stream.readInt32();
    this.AnchorSection = new AnchorSection(stream);
    this.AnchorExtensionSection = new AnchorExtensionSection(stream);
    this.Fingerprints1 = new FingerprintSection(stream);
    this.Fingerprints2 = new FingerprintSection(stream);
    this.NotesSection = new NotesSection(stream);
    this.PhraseCount = stream.readInt32();
    this.AverageNotesPerIteration = [];
    for (let i = 0; i < this.PhraseCount; i++) {
      (this.AverageNotesPerIteration as number[]).push(stream.readFloat());
    }
    this.PhraseIterationCount1 = stream.readInt32();
    this.NotesInIteration1 = [];
    for (let i = 0; i < this.PhraseIterationCount1; i++) {
      (this.NotesInIteration1 as number[]).push(stream.readInt32());
    }
    this.PhraseIterationCount2 = stream.readInt32();
    this.NotesInIteration2 = [];
    for (let i = 0; i < this.PhraseIterationCount2; i++) {
      (this.NotesInIteration2 as number[]).push(stream.readInt32());
    }
  }
}

export class ArrangementSection {
  public readonly Count: number;
  public readonly Arrangements: ReadonlyArray<Arrangement>;

  constructor(stream: Stream) {
    this.Count = stream.readInt32();
    this.Arrangements = [];
    for (let i = 0; i < this.Count; i++) {
      (this.Arrangements as Arrangement[]).push(new Arrangement(stream));
    } 
  }
}

export class Metadata {
  public readonly MaxScore: number;
  public readonly MaxNotesAndChords: number;
  public readonly MaxNotesAndChordsReal: number;
  public readonly PointsPerNote: number;
  public readonly FirstBeatLength: number;
  public readonly StartTime: number;
  public readonly CapoFretId: number;
  public readonly LastConversionDateTime: ArrayBuffer;
  public readonly Part: number;
  public readonly SongLength: number;
  public readonly StringCount: number;
  public readonly Tuning: ReadonlyArray<number>;
  public readonly Unk1FirstNoteTime: number;
  public readonly Unk2FirstNoteTime: number;
  public readonly MaxDifficulty: number;

  constructor(stream: Stream) {
    this.MaxScore = stream.readDouble();
    this.MaxNotesAndChords = stream.readDouble();
    this.MaxNotesAndChordsReal = stream.readDouble();
    this.PointsPerNote = stream.readDouble();
    this.FirstBeatLength = stream.readFloat();
    this.StartTime = stream.readFloat();
    this.CapoFretId = stream.readByte();
    this.LastConversionDateTime = stream.readBytes(32);
    this.Part = stream.readInt16();
    this.SongLength = stream.readFloat();
    this.StringCount = stream.readInt32();
    this.Tuning = [];
    for (let i = 0; i < this.StringCount; i++) {
      (this.Tuning as number[]).push(stream.readInt16());
    }
    this.Unk1FirstNoteTime = stream.readFloat();
    this.Unk2FirstNoteTime = stream.readFloat();
    this.MaxDifficulty = stream.readInt32();
  }
}

export class Sng2014File {
  public readonly BPMSection: BpmSection;
  public readonly PhraseSection: PhraseSection;
  public readonly ChordSection: ChordSection;
  public readonly ChordNotesSection: ChordNotesSection;
  public readonly VocalsSection: VocalSection;
  public readonly SymbolsHeaderSection?: SymbolsHeaderSection;
  public readonly SymbolsTextureSection?: SymbolsTextureSection;
  public readonly SymbolsDefinitionSection?: SymbolDefinitionSection;
  public readonly PhraseIterationSection: PhraseIterationSection;
  public readonly PhraseExtraInfoSection: PhraseExtraInfoByLevelSection;
  public readonly NLinkedDifficultySection: NLinkedDifficultySection;
  public readonly ActionSection: ActionSection;
  public readonly EventSection: EventSection;
  public readonly ToneSection: ToneSection;
  public readonly DnaSection: DnaSection;
  public readonly SectionSections: SectionSection;
  public readonly ArrangementSection: ArrangementSection;
  public readonly Metadata: Metadata;

  constructor(stream: Stream) {
     this.BPMSection = new BpmSection(stream);
     this.PhraseSection = new PhraseSection(stream);
     this.ChordSection = new ChordSection(stream);
     this.ChordNotesSection = new ChordNotesSection(stream);
     this.VocalsSection = new VocalSection(stream);
     if (this.VocalsSection.Count > 0) {
       this.SymbolsHeaderSection = new SymbolsHeaderSection(stream);
       this.SymbolsTextureSection = new SymbolsTextureSection(stream);
       this.SymbolsDefinitionSection = new SymbolDefinitionSection(stream);
     }
     this.PhraseIterationSection = new PhraseIterationSection(stream);
     this.PhraseExtraInfoSection = new PhraseExtraInfoByLevelSection(stream);
     this.NLinkedDifficultySection = new NLinkedDifficultySection(stream);
     this.ActionSection = new ActionSection(stream);
     this.EventSection = new EventSection(stream);
     this.ToneSection = new ToneSection(stream);
     this.DnaSection = new DnaSection(stream);
     this.SectionSections = new SectionSection(stream);
     this.ArrangementSection = new ArrangementSection(stream);
     this.Metadata = new Metadata(stream);
  }
}
