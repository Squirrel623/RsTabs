import { PSARCLoader, Entry } from "./deserializer/psarc-loader";
import { arrayBufferToString } from "./utils/utils";
import { unpackSng, Song2014 } from "./models/sng";
import { Sng2014File } from './deserializer/sng-importer';
import { Stream } from "./utils/stream";

export class PSARCBrowser {
  private readonly psarcLoader: PSARCLoader;
  public readonly Identifier: string;

  constructor(srcBuffer: ArrayBuffer) {
    this.psarcLoader = new PSARCLoader(srcBuffer);
    this.psarcLoader.read();

    const partRegex = /songs\/bin\/generic\/(.*)_lead\.sng$/;
    let identifier = '';
    for (let content of this.psarcLoader.getTableOfContents()) {
      const match = partRegex.exec(content.name)
      if (match) {
        identifier = match[1];
        break;
      }
    }
    if (identifier === '') {
      throw new Error('cant find part');
    }
    this.Identifier = identifier;
  }

  public getArrangement(arrangement: string) {
    const toc = this.psarcLoader.getTableOfContents();
    const jsonEntry = toc.find((entry) => entry.name.startsWith('manifests/songs') && entry.name.endsWith(`/${this.Identifier}_${arrangement}.json`));
    if (!jsonEntry) {
      throw new Error("Can't find json file entry");
    }
    const sngEntry = toc.find((entry) => entry.name === `songs/bin/generic/${this.Identifier}_${arrangement}.sng`);
    if (!sngEntry) {
      throw new Error("Can't find sng file entry");
    }

    let manifest;
    try {
      manifest = JSON.parse(arrayBufferToString(jsonEntry.data));
    } catch(err) {
      throw new Error('Error when parsing arrangement attributes');
    }

    const attributes = manifest.Entries[Object.keys(manifest.Entries)[0]].Attributes;
    const sngBuffer = unpackSng(sngEntry.data);
    const sng = new Sng2014File(new Stream(sngBuffer, undefined, true));
    return new Song2014(sng, attributes);
  }
}