import pako from 'pako';

export function uncompress(src: ArrayBuffer): ArrayBuffer {
  try {
    return (pako.inflate(new Uint8Array(src)) as Uint8Array).buffer;
  } catch (err) {
    throw err;
  }
}