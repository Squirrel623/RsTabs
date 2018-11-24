import { AnchorSection } from "../deserializer/sng-importer";

export class SongAnchor {
  private _Time: number = -1;
  public get Time() {return this._Time;}
  private _Fret: number = -1;
  public get Fret() {return this._Fret;}
  private _Width: number = -1;
  public get Width() {return this._Width;}

  public static ParseSng(anchorSection: AnchorSection): SongAnchor[] {
    const anchors = new Array<SongAnchor>(anchorSection.Count);

    for (let i = 0; i < anchorSection.Count; i++) {
      const anchor = new SongAnchor();
      anchor._Time = anchorSection.Anchors[i].StartBeatTime;
      anchor._Fret = anchorSection.Anchors[i].FretId;
      anchor._Width = anchorSection.Anchors[i].Width;
      anchors[i] = anchor;
    }

    return anchors;
  }
}
