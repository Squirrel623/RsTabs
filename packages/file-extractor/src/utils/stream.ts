export class Stream {
  private readonly srcBuffer: ArrayBuffer;

  constructor(src: ArrayBuffer, private currentOffset = 0, private littleEndian = false) {
    this.srcBuffer = src;
  }

  public get offset() {
    return this.currentOffset;
  }

  public backtrack(amount: number): void {
    if (amount > this.currentOffset) {
      throw new Error('Cant backtrack');
    }

    this.currentOffset -= amount;
  }

  public getCurrentView(): ArrayBuffer {
    const copy = this.srcBuffer.slice(this.currentOffset);
    return copy;
  }

  public getBuffer(): ArrayBuffer {
    return this.srcBuffer;
  }

  public readByte(): number {
    const uintView = new DataView(this.srcBuffer, this.currentOffset, 1);
    this.currentOffset += 1;

    return uintView.getUint8(0);
  }
 
  public readBytes(numBytes: number): ArrayBuffer {
    if (numBytes + this.currentOffset > this.srcBuffer.byteLength) {
      numBytes = this.srcBuffer.byteLength - this.currentOffset;
    }

    var retVal = new ArrayBuffer(numBytes);
    new Uint8Array(retVal).set(new Uint8Array(this.srcBuffer, this.currentOffset, numBytes));
    this.currentOffset += numBytes;
    return retVal;
  }

  public writeBytes(src: ArrayBuffer): void {
    const srcUInt8View = new Uint8Array(src);
    const destUInt8View = new Uint8Array(this.srcBuffer, this.currentOffset, src.byteLength);

    destUInt8View.set(srcUInt8View);
    this.currentOffset += src.byteLength;
  }

  public readFloat(littleEndian=false): number {
    const uintView = new DataView(this.srcBuffer, this.currentOffset, 4);
    this.currentOffset += 4;

    return uintView.getFloat32(0,this.littleEndian || littleEndian);
  }

  public readDouble(littleEndian=false): number {
    const uintView = new DataView(this.srcBuffer, this.currentOffset, 8);
    this.currentOffset += 8;

    return uintView.getFloat64(0,this.littleEndian || littleEndian);
  }

  public readUInt16(littleEndian=false): number {
    const uintView = new DataView(this.srcBuffer, this.currentOffset, 2);
    this.currentOffset += 2;

    return uintView.getUint16(0,this.littleEndian || littleEndian);
  }

  public readInt16(littleEndian=false): number {
    const uintView = new DataView(this.srcBuffer, this.currentOffset, 2);
    this.currentOffset += 2;

    return uintView.getInt16(0,this.littleEndian || littleEndian);
  }

  public readUInt24(littleEndian=false): number {
    const uintView = new DataView(this.srcBuffer, this.currentOffset, 3);
    const firstByte = uintView.getUint8(0);
    const secondByte = uintView.getUint8(1);
    const thirdByte = uintView.getUint8(2);

    return ((firstByte << 16) + (secondByte << 8) + thirdByte);
  }

  public readUInt32(littleEndian=false): number {
    const uintView = new DataView(this.srcBuffer, this.currentOffset, 4);
    this.currentOffset += 4;

    return uintView.getUint32(0,this.littleEndian || littleEndian);
  }

  public readInt32(littleEndian=false): number {
    const uintView = new DataView(this.srcBuffer, this.currentOffset, 4);
    this.currentOffset += 4;

    return uintView.getInt32(0,this.littleEndian || littleEndian);
  }

  public readUInt40(): number {
    const uint32 = Math.pow(2, 8) * this.readUInt32();
    if (!Number.isSafeInteger(uint32)) {
      throw Error('unsafe number;')
    }

    const uintView = new DataView(this.srcBuffer, this.currentOffset, 1);
    this.currentOffset += 1;
    const lastByte = uintView.getUint8(0);

    return uint32 + lastByte;
  }
}