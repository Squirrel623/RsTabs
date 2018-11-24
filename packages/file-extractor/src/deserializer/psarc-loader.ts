import {Stream} from '../utils/stream';
import { decrypt } from './decryptor';
import { uncompress } from './uncompressor';
import { arrayBufferToString } from '../utils/utils';

export interface Entry {
  name: string;
  data: ArrayBuffer;
  id: number;
  MD5: Uint8Array;
  zIndexBegin: number;
  length: number;
  offset: number;
}

const headerByteSize = 32;
interface Header {
  magicNumber: number;
  versionNumber: number;
  compressionMethod: number;
  totalTOCSize: number;
  tocEntrySize: number;
  numFiles: number;
  blockSizeAlloc: number;
  archiveFlags: number;
}

function logX(val: number, base: number): number {
  return Math.log(val) / Math.log(base);
}

export function readHeader(srcStream: Stream): Header {
  const magicNumber = srcStream.readUInt32();

  if (magicNumber !== 1347633490) {
    throw new Error('Magic number wrong');
  }

  return {
    magicNumber,
    versionNumber: srcStream.readUInt32(),
    compressionMethod: srcStream.readUInt32(),
    totalTOCSize: srcStream.readUInt32(),
    tocEntrySize: srcStream.readUInt32(),
    numFiles: srcStream.readUInt32(),
    blockSizeAlloc: srcStream.readUInt32(),
    archiveFlags: srcStream.readUInt32()
  }
}

export class PSARCLoader {
  private readonly srcBuffer: ArrayBuffer;
  private srcStream: Stream;
  private header?: Header;
  private tableOfContents: Entry[] = [];

  constructor(src: ArrayBuffer) {
    this.srcBuffer = src;
    this.srcStream = new Stream(src);
  }

  public getTableOfContents(): ReadonlyArray<Entry> {
    return this.tableOfContents;
  }

  private inflateEntry(header: Readonly<Header>, entry: Entry, zBlocksSizeList: ReadonlyArray<number>) {
    if (entry.length === 0) {
      return;
    }
  
    const zHeader = 0x78DA;
    let zChunkID = entry.zIndexBegin;
    const blockSize = header.blockSizeAlloc;

    const srcStream = new Stream(this.srcBuffer, entry.offset);
    const destStream = new Stream(entry.data);

    do {
      const currentBlockSize = zBlocksSizeList[zChunkID];

      if (currentBlockSize === 0) {
        destStream.writeBytes(srcStream.readBytes(blockSize));
      } else {
        const num = srcStream.readUInt16();
        srcStream.backtrack(2);
        const arr = srcStream.readBytes(currentBlockSize);

        if (num == zHeader) {
          destStream.writeBytes(uncompress(arr));
        } else {
          destStream.writeBytes(arr);
        }
      }

      zChunkID++;
    } while (destStream.offset < entry.length);
  }

  public read() {
    this.header = readHeader(this.srcStream);
    const tocSize = this.header.totalTOCSize - headerByteSize;

    if (this.header.archiveFlags === 4) {
      const encryptedTOC = this.srcStream.getCurrentView().slice(0, tocSize);
      const decrypted = decrypt(encryptedTOC);
      this.srcStream = new Stream(decrypted);
    }

    const toc: Entry[] = [];
    for (let i = 0; i < this.header.numFiles; i++) {
      const MD5 = new Uint8Array(this.srcStream.readBytes(16));
      const zIndexBegin = this.srcStream.readUInt32();
      const length = this.srcStream.readUInt40();
      const offset = this.srcStream.readUInt40();

      const newEntry: Entry = {
        name: '',
        id: i,
        MD5,
        zIndexBegin,
        length,
        offset,
        data: new ArrayBuffer(length),
      };
      toc.push(newEntry);
    }

    // Back to unencrypted (but potentially compressed)

    const tocChunkSize = this.header.numFiles * this.header.tocEntrySize;
    const bNum = logX(this.header.blockSizeAlloc, 256)
    const zNum = (tocSize - tocChunkSize) / bNum;
    const zLengths = new Array(zNum);

    for(let i = 0; i < zNum; i++) {
      switch(bNum) {
        case 2:
          zLengths[i] = this.srcStream.readUInt16();
          break;
        case 3:
          zLengths[i] = this.srcStream.readUInt24();
          break;
        case 4:
          zLengths[i] = this.srcStream.readUInt32();
          break;
      }
    }

    if (this.header.compressionMethod !== 2053925218) {
      throw new Error('Unsupported Compression Method')
    }

    const firstTOCEntry = toc[0];
    firstTOCEntry.name = 'NamesBlock.bin';
    this.inflateEntry(this.header, firstTOCEntry, zLengths);

    var names = arrayBufferToString(firstTOCEntry.data).split('\n');
    for (let i = 0; i < names.length; i++) {
      toc[i+1].name = names[i];
      this.inflateEntry(this.header, toc[i+1], zLengths);
    }
    this.tableOfContents = toc;
  }
}