import { decryptSng } from '../deserializer/decryptor';
import { Stream } from '../utils/stream';
import { uncompress } from '../deserializer/uncompressor';
import {
  Sng2014File,
  PhraseSection as SngPhraseSection,
  PhraseIteration as SngPhraseIteration,
  PhraseIterationSection as SngPhraseIterationSection,
  ChordSection as SngChordSection,
  BpmSection as SngBpmSection,
  EventSection as SngEventSection,
  SectionSection as SngSectionSection,
} from '../deserializer/sng-importer';
import { 
  Attributes2014,
  Section as ManifestSection,
  ChordTemplate as ManifestChordTemplate,
} from './attributes';
import { arrayBufferToNullTerminatedString, shallowArraysEqual } from '../utils/utils';
import { SongNote } from './note';
import { SongChord } from './chord';
import { SongAnchor } from './anchor';

export function unpackSng(src: ArrayBuffer): ArrayBuffer {
  const decrypted = decryptSng(src);
  const stream = new Stream(decrypted);
  const length = stream.readUInt32(true);
  return uncompress(stream.getCurrentView());
}

export type ArrangementType = 'lead' | 'rhythm' | 'bass';

export class Song2014 {
  private readonly songFile: Sng2014File;
  private readonly attributes: Attributes2014;

  public readonly Version: string;
  public readonly Title: string;
  public readonly Arrangement: ArrangementType = 'lead';
  //public readonly Part: number;
  //public readonly Offset: number;
  //public readonly CentOffset: string;
  public readonly SongLength: number;
  //public readonly SongNameSort: string;
  public readonly StartBeat: number;
  public readonly AverageTempo: number;
  public readonly Tuning: any;
  //public readonly Capo: number;
  public readonly ArtistName: string;
  //public readonly ArtistNameSort: string;
  //public readonly AlbumName: string;
  //public readonly AlbumNameSort: string;
  public readonly AlbumYear: string;
  //public readonly AlbumArt: string;
  public readonly CrownSpeed: string;
  //public readonly LastConversionDateTime: string;

  public readonly Sections: ReadonlyArray<SongSection>;
  public readonly Phrases: ReadonlyArray<SongPhrase>;
  public readonly PhraseIterations: ReadonlyArray<SongPhraseIteration>;
  public readonly ChordTemplates: ReadonlyArray<SongChordTemplate>;
  public readonly SongEBeats: ReadonlyArray<SongEBeat>;
  public readonly Events: ReadonlyArray<SongEvent>;
  public readonly Levels: ReadonlyArray<SongLevel>;

  constructor(songFile: Sng2014File, attr: Attributes2014) {
    this.songFile = songFile;
    this.attributes = attr;

    this.Version = '7';
    this.CrownSpeed = '1';

    this.Title = attr.SongName;
    this.SongLength = songFile.Metadata.SongLength;
    this.AverageTempo = attr.SongAverageTempo;
    
    this.ArtistName = attr.ArtistName;
    this.AlbumYear = attr.AlbumYear;

    this.Sections = SongSection.ParseSng(songFile.SectionSections);
    this.Phrases = SongPhrase.ParseSng(songFile.PhraseSection);
    this.PhraseIterations = SongPhraseIteration.ParseSng(songFile.PhraseIterationSection);
    this.ChordTemplates = SongChordTemplate.ParseSng(songFile.ChordSection);
    SongChordTemplate.AddChordIds(this.ChordTemplates as SongChordTemplate[], attr.ChordTemplates);

    this.SongEBeats = SongEBeat.ParseSng(songFile.BPMSection);
    this.StartBeat = songFile.BPMSection.BPMs[0].Time;
    this.Events = SongEvent.ParseSng(songFile.EventSection);
    this.Levels = SongLevel.ParseSng(songFile);
  }
}

export class SongSection {
  constructor(public readonly Name: string, public readonly Number: number, public readonly StartTime: number) {}

  public static ParseManifest(manifestSections: ManifestSection[]): SongSection[] {
    const sections = new Array<SongSection>(manifestSections.length);
    for (let i = 0; i < manifestSections.length; i++) {
      const section = new SongSection(
        manifestSections[i].Name,
        manifestSections[i].Number,
        manifestSections[i].StartTime,
      );
      sections[i] = section;
    }
    return sections;
  }

  public static ParseSng(sngSection: SngSectionSection): SongSection[] {
    const sections = new Array<SongSection>(sngSection.Count);

    for (let i = 0; i < sngSection.Count; i++) {
      const section = new SongSection(
        arrayBufferToNullTerminatedString(sngSection.Sections[i].Name),
        sngSection.Sections[i].Number,
        sngSection.Sections[i].StartTime,
      );
      sections[i] = section;
    }

    return sections;
  }
}

export class SongPhrase {
  constructor(
    public readonly Disparity: number,
    public readonly Ignore: number,
    public readonly MaxDifficulty: number,
    public readonly Name: string,
    public readonly Solo: number,
  ) {}

  public static ParseSng(phraseSections: SngPhraseSection): SongPhrase[] {
    const phrases = new Array<SongPhrase>(phraseSections.Count);
    for (let i = 0; i < phraseSections.Count; i++) {
      phrases[i] = new SongPhrase(
        phraseSections.Phrases[i].Disparity,
        phraseSections.Phrases[i].Ignore,
        phraseSections.Phrases[i].MaxDifficulty,
        arrayBufferToNullTerminatedString(phraseSections.Phrases[i].Name),
        phraseSections.Phrases[i].Solo,
      )
    }

    return phrases;
  }
}

export class HeroLevel {
  constructor(
    public readonly Difficulty: number,
    public readonly Hero: number,
  ) {}

  public static ParseSng(phraseIteration: SngPhraseIteration): HeroLevel[] {
    const heroLevels = new Array<HeroLevel>(3);
    for (let i = 0; i < heroLevels.length; i++) {
      heroLevels[i] = new HeroLevel(
        i + 1,
        phraseIteration.Difficulty[i],
      );
    }
    return heroLevels;
  } 
}

export class SongPhraseIteration {
  private _StartTime: number = -1;
  public get StartTime() {return this._StartTime};

  private _EndTime: number = -1;
  public get EndTime() {return this._EndTime;}

  private _PhraseId: number = -1;
  public get PhraseId() {return this._PhraseId};

  private _Variation: string = '';
  public get Variation(){return this._Variation};

  private _HeroLevels?: HeroLevel[];
  public get HeroLevels(): ReadonlyArray<HeroLevel>|undefined {return this._HeroLevels};

  public static ParseSng(piSection: SngPhraseIterationSection): SongPhraseIteration[] {
    const spIters = new Array<SongPhraseIteration>(piSection.Count);
    for (let i = 0; i < piSection.Count; i++) {
      const pi = new SongPhraseIteration();
      pi._PhraseId = piSection.PhraseIterations[i].PhraseId;
      pi._StartTime = piSection.PhraseIterations[i].StartTime;
      pi._EndTime = piSection.PhraseIterations[i].NextPhraseTime;
      pi._Variation = '';

      const difficulty = piSection.PhraseIterations[i].Difficulty
      if (!shallowArraysEqual(difficulty, [0, 0, 0])) {
        pi._HeroLevels = HeroLevel.ParseSng(piSection.PhraseIterations[i]);
      }

      spIters[i] = pi;
    }
    return spIters;
  }
}

export class SongChordTemplate {
  private _DisplayName = '';
  public get DisplayName() {return this._DisplayName;}
  private _ChordName = '';
  public get ChordName() {return this._ChordName;}
  private _ChordId: number = -1;
  public get ChordId() {return this._ChordId};

  private _Fret0 = -1;
  public get Fret0() {return this._Fret0;}
  private _Fret1 = -1;
  public get Fret1() {return this._Fret1;}
  private _Fret2 = -1;
  public get Fret2() {return this._Fret2;}
  private _Fret3 = -1;
  public get Fret3() {return this._Fret3;}
  private _Fret4 = -1;
  public get Fret4() {return this._Fret4;}
  private _Fret5 = -1;
  public get Fret5() {return this._Fret5;}

  private _Finger0 = -1;
  public get Finger0() {return this._Finger0;}
  private _Finger1 = -1;
  public get Finger1() {return this._Finger1;}
  private _Finger2 = -1;
  public get Finger2() {return this._Finger2;}
  private _Finger3 = -1;
  public get Finger3() {return this._Finger3;}
  private _Finger4 = -1;
  public get Finger4() {return this._Finger4;}
  private _Finger5 = -1;
  public get Finger5() {return this._Finger5;}

  public static AddChordIds(chordTemplates: SongChordTemplate[], manifestTemplates: ManifestChordTemplate[]): void {
    for (let i = 0; i < manifestTemplates.length; i++) {
      const template = manifestTemplates[i];
      const matchingChord = chordTemplates.find(ctpl => 
        ctpl.Fret0 === template.Frets[0] &&
        ctpl.Fret1 === template.Frets[1] &&
        ctpl.Fret2 === template.Frets[2] &&
        ctpl.Fret3 === template.Frets[3] &&
        ctpl.Fret4 === template.Frets[4] &&
        ctpl.Fret5 === template.Frets[5]
      );
      if (matchingChord) {
        matchingChord._ChordId = template.ChordId;
        matchingChord._ChordName = template.ChordName;
      }
    }
  }

  public static ParseSng(chordSection: SngChordSection): SongChordTemplate[] {
    const chordTemplates = new Array<SongChordTemplate>(chordSection.Count);
    for (let i = 0; i < chordSection.Count; i++) {
      const sngChordSection = chordSection.Chords[i];
      const sct = new SongChordTemplate();
      sct._DisplayName = sct._ChordName = arrayBufferToNullTerminatedString(sngChordSection.Name);
      sct._Finger0 = sngChordSection.Fingers[0];
      sct._Finger1 = sngChordSection.Fingers[1];
      sct._Finger2 = sngChordSection.Fingers[2];
      sct._Finger3 = sngChordSection.Fingers[3];
      sct._Finger4 = sngChordSection.Fingers[4];
      sct._Finger5 = sngChordSection.Fingers[5];
      sct._Fret0 = sngChordSection.Frets[0];
      sct._Fret1 = sngChordSection.Frets[1];
      sct._Fret2 = sngChordSection.Frets[2];
      sct._Fret3 = sngChordSection.Frets[3];
      sct._Fret4 = sngChordSection.Frets[4];
      sct._Fret5 = sngChordSection.Frets[5];

      let mask = sngChordSection.Mask;
      if (mask & 0x00000001) {
        mask &= ~0x00000001;
        sct._DisplayName += '-arp';
      } else if (mask & 0x00000002) {
        mask &= ~0x00000002;
        sct._DisplayName += '-nop';
      }

      chordTemplates[i] = sct;
    }

    return chordTemplates;
  }
}

export class SongEBeat {
  private _Time: number = -1;
  public get Time() {return this._Time;}

  private _Measure: number = -1;
  public get Measure() {return this._Measure;}

  public static ParseSng(bpmSection: SngBpmSection): SongEBeat[] {
    const songEBeats = new Array<SongEBeat>(bpmSection.Count);

    for (let i = 0; i < bpmSection.Count; i++) {
      const beat = new SongEBeat();
      beat._Time = bpmSection.BPMs[i].Time;
      if (bpmSection.BPMs[i].Mask !== 0) {
        beat._Measure = bpmSection.BPMs[i].Measure;
      }
      songEBeats[i] = beat;
    }

    return songEBeats;
  }
}

export class SongEvent {
  constructor(
    public readonly Time: number,
    public readonly Code: string,
  ) {}

  public static ParseSng(eventSection: SngEventSection): SongEvent[] {
    const events = new Array<SongEvent>(eventSection.Count);
    for (let i = 0; i < eventSection.Count; i++) {
      events[i] = new SongEvent(
        eventSection.Events[i].Time,
        arrayBufferToNullTerminatedString(eventSection.Events[i].EventName),
      );
    }
    return events;
  }
}

export class SongLevel {
  public Difficulty: number = 0;
  public Notes: SongNote[] = [];
  public Chords: SongChord[] = [];
  public Anchors: SongAnchor[] = [];

  public static ParseSng(sngData: Sng2014File): SongLevel[] {
    const levels = new Array<SongLevel>(sngData.ArrangementSection.Count);

    for (let i = 0; i < sngData.ArrangementSection.Count; i++) {
      const arngSection = sngData.ArrangementSection.Arrangements[i];

      const level = new SongLevel();
      level.Difficulty = arngSection.Difficulty;
      level.Notes = SongNote.ParseSng(arngSection.NotesSection);
      level.Chords = SongChord.ParseSng(sngData, arngSection.NotesSection);
      level.Anchors = SongAnchor.ParseSng(arngSection.AnchorSection);

      levels[i] = level;
    }

    return levels;
  }
}
