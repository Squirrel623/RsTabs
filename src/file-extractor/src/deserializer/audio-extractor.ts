type EmscripenFSStream = 'asdlfkjl';

type EmscripenFS = {
  open: (name: string, opts: string) => EmscripenFSStream;
  write: (stream: EmscripenFSStream, buffer: ArrayBufferView, offset: number, length: number, position: number) => void;
  close: (stream :EmscripenFSStream) => void;
  readFile: (name: string) => Uint8Array;
}

type EmscripenModule = {
  ccall: <T = any>(fnName: string, returnType: string, paramTypes: string[], params: any[]) => T;
  FS: EmscripenFS;
};

declare const Module: EmscripenModule;

export function getAudioFromArchive(src: ArrayBuffer): ArrayBuffer|null {
  try {
    const audioAsUInt8 = new Uint8Array(src);

    const inputFilePath = 'inputPath';
    const outputFilePath = 'outputPath';

    const dummy = Module.FS.open(inputFilePath, 'w+');
    Module.FS.write(dummy, audioAsUInt8, 0, audioAsUInt8.length, 0);
    Module.FS.close(dummy);

    Module.ccall('processWW',
      'number',
      ['string', 'string'],
      [inputFilePath, outputFilePath]
    );

    const output: Uint8Array = Module.FS.readFile(outputFilePath);

    return output.buffer;
  } catch(err) {
    return null;
  }
}