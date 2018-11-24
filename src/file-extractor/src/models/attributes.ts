export interface ArrangementProperties {

}

export interface ChordTemplate {
  ChordId: number;
  ChordName: string;
  Fingers: number[];
  Frets: number[];
}

export interface PhraseIteration {
  PhraseIndex: number;
  MaxDifficulty: number;
  Name: string;
  StartTime: number;
  EndTime: number;
  MaxScorePerDifficulty: number[];
}

export interface Phrase {
  MaxDifficulty: number;
  Name: string;
  IterationCount: number;
}

export interface Section {
  Name: string;
  UIName: string;
  Number: number;
  StartTime: number;
  EndTime: number;
  StartPhraseIterationIndex: number;
  EndPhraseIterationIndex: number;
  IsSolo: boolean;
}

export interface TuningStrings {
  String0: number;
  String1: number;
  String2: number;
  String3: number;
  String4?: number;
  String5?: number;
}

export interface Attributes2014 {
  ArtistName: string;
  AlbumYear: string;
  SongName: string;
  ArrangementProperties: ArrangementProperties;
  ArrangementSort: number;
  ArrangementType?: number;
  Chords: Record<string, Record<string, number[]>>;
  ChordTemplates: ChordTemplate[];
  FullName: string;
  LastConversionDateTime: string;
  MaxPhraseDifficulty: number;
  PhraseIterations: PhraseIteration[];
  Phrases: Phrase[];
  Sections: Section[];
  SongAverageTempo: number;
  Tuning: TuningStrings;
}