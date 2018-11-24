import { ChordTemplate } from "./chord";
import { Song2014 } from "../models/sng";
import { Measure } from "./measure";

export class Track {
  //private _Identifier: string;
  //public Identifier() {return this._Identifier;}
  private _Name: string;
  public get Name() {return this._Name;}
  //private _DifficultyLevel: number;
  //public DifficultyLevel() {return this._DifficultyLevel;}
  public Tuning: number[] = [];

  //public Bars: Bar[] = [];
  public ChordTemplates: Record<number, ChordTemplate> = {};
  //public AverageBeatsPerMinute: number;
  private _Measures: Measure[] = [];
  public get Measures(): ReadonlyArray<Measure> {return this._Measures;}

  constructor(sngData: Song2014) {
    //const track = new Track();
    this._Name = sngData.Title;
    this._Measures = Measure.FromSng(sngData);
  }
}