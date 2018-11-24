import { Track } from '../../file-extractor/src';

export class Player {
  private track?: Track;
  
  private currentTime: number = -1;

  public loadTrack(track: Track) {
    this.track = track;
  }
}