import { Song2014 } from "../models/sng";

export class Section {
  private _StartTime: number = -1;
  public get StartTime() {return this._StartTime;}
  //private _EndTime: number;
  //public get EndTime() {return this._EndTime;}
  private _Name: string = '';
  public get Name() {return this._Name}

  public static FromSng(sngData: Song2014): Section[] {
    const sections: Section[] = [];

    for (let i = 0; i < sngData.Sections.length; i++) {
      const section = new Section();
      section._StartTime = sngData.Sections[i].StartTime;
      section._Name = sngData.Sections[i].Name;
    }

    return sections;
  }
}