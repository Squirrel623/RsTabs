import { ChordTemplate } from "./chord";
import { Song2014 } from "../models/sng";
import { Measure } from "./measure";

export class Track {
  private _Name: string;
  public get Name() {return this._Name;}

  private _StartTime: number;
  public get StartTime() {return this._StartTime;}

  private _SongLength: number;
  public get SongLength() {return this._SongLength;}

  private _Measures: Measure[] = [];
  public get Measures(): ReadonlyArray<Measure> {return this._Measures;}

  /* private _AudioBuffer: ArrayBuffer;
  public get AudioBuffer() {return this._AudioBuffer;} */

  constructor(sngData: Song2014) {
    this._SongLength = sngData.SongLength;
    this._StartTime = sngData.StartBeat;
    this._Name = sngData.Title;
    this._Measures = Measure.FromSng(sngData);
  }
}