export function arrayBufferToString(src: ArrayBuffer): string {
  const uint8View = new Uint8Array(src);
  var encodedString = String.fromCharCode.apply(null, uint8View);
  return decodeURIComponent(escape(encodedString));
}

export function arrayBufferToNullTerminatedString(src: ArrayBuffer): string {
  const uint8View = new Uint8Array(src);
  const firstZero = uint8View.findIndex((val) => val === 0);

  return new TextDecoder('utf-8').decode(src.slice(0, firstZero));
  //return arrayBufferToString(src);
}

export function shallowArraysEqual<T>(first: T[], second: T[]): boolean {
  if (!first || !second) {
    return false;
  }

  if (first.length != second.length) {
    return false;
  }

  for (let i = 0; i < first.length; i++) {
    if (first[i] !== second[i]) {
      return false;
    }
  }

  return true;
}

export function flattenArray(arr: any): any {
  let retArray = new Array();
  for (let item of arr) {
    if (Array.isArray(item)) {
      retArray = retArray.concat(item);
    } else {
      retArray.push(item);
    }
  }
  return retArray;
}

export function unique<T>(arr: T[]): T[] {
  const retVal: T[] = [];
  for (let val of arr) {
    if (retVal.findIndex((v) => v === val) < 0) {
      retVal.push(val);
    }
  }
  return retVal;
}