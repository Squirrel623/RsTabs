import aesjs from 'aes-js';
import { Stream } from '../utils/stream';

const copyArray = aesjs._arrayTest.copyArray;

const key = [
  0xC5, 0x3D, 0xB2, 0x38, 0x70, 0xA1, 0xA2, 0xF7,
  0x1C, 0xAE, 0x64, 0x06, 0x1F, 0xDD, 0x0E, 0x11,
  0x57, 0x30, 0x9D, 0xC8, 0x52, 0x04, 0xD4, 0xC5,
  0xBF, 0xDF, 0x25, 0x09, 0x0D, 0xF2, 0x57, 0x2C
];

const sngKey = [
  0xCB, 0x64, 0x8D, 0xF3, 0xD1, 0x2A, 0x16, 0xBF,
  0x71, 0x70, 0x14, 0x14, 0xE6, 0x96, 0x19, 0xEC,
  0x17, 0x1C, 0xCA, 0x5D, 0x2A, 0x14, 0x2E, 0x3E,
  0x59, 0xDE, 0x7A, 0xDD, 0xA1, 0x8A, 0x3A, 0x30
]

const iv = new Uint8Array(16);

export function decrypt(src: ArrayBuffer): ArrayBuffer {
  let uintSrc = new Uint8Array(src);
  if (src.byteLength % 16 !== 0) {
    const tmp = new Uint8Array(new ArrayBuffer(src.byteLength + (16 - (src.byteLength % 16))));
    tmp.set(uintSrc);
    uintSrc = tmp;
  }

  const byteArray = Array.from(uintSrc);
  const aesCfb = new aesjs.ModeOfOperation.cfb(key, iv, 16);
  const decryptedBytes: Uint8Array = aesCfb.decrypt(byteArray);

  return decryptedBytes.buffer;
}

export function decryptSng(src: ArrayBuffer): ArrayBuffer {
  const stream = new Stream(src);
  const header = stream.readUInt32(true);
  if (header !== 0x4A) {
    throw new Error('Invalid Sng File');
  }
  stream.readBytes(4);

  const iv = new Uint8Array(stream.readBytes(16));
  const aesCfb = new aesjs.ModeOfOperation.cfb(sngKey, iv, 16);

  const data = stream.getCurrentView();
  const dest = new Stream(new ArrayBuffer(data.byteLength + (16 - (data.byteLength % 16))));

  for (let i = 0; i < data.byteLength; i += 16) {
    const segment = new Uint8Array(stream.readBytes(16));
    const decrypted: Uint8Array = aesCfb.decryptSegment(segment);
    dest.writeBytes(decrypted.buffer);

    let iv: Uint8Array = new Uint8Array(new ArrayBuffer(16));
    copyArray(aesCfb._shiftRegister, iv, 0, 0, 16);
    for (let j = iv.length - 1, carry = true; j >= 0 && carry; j--) {
      let valuePlusOne = iv[j] + 1;
      if (valuePlusOne === 256) {
        valuePlusOne = 0;
      } else {
        carry = false;
      }
      iv[j] = valuePlusOne;
    }
    aesCfb._shiftRegister = iv;
  }

  return dest.getBuffer().slice(0, src.byteLength - 24);
}

//declare function copyArray(src: any, target: any, targetStart: number, sourceStart: number, sourceEnd?: number);

aesjs.ModeOfOperation.cfb.prototype.decryptSegment = decryptSegment;
function decryptSegment(this: any, ciphertext: Uint8Array): Uint8Array {
  const originalData = new Uint8Array(new ArrayBuffer(this.segmentSize));
  originalData.set(ciphertext);

  const workingArray = new Uint8Array(new ArrayBuffer(this.segmentSize));
  workingArray.set(ciphertext);

  const xorSegment = this._aes.encrypt(this._shiftRegister);
  for (var i = 0; i < this.segmentSize; i++) {
    workingArray[i] ^= xorSegment[i]; 
  }

  // Shift the register
  //copyArray(this._shiftRegister, this._shiftRegister, 0, this.segmentSize);
  //copyArray(originalData, this._shiftRegister, 0, 0, this.segmentSize);

  return workingArray;
}