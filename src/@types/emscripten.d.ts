export type EmscripenFSStream = 'asdlfkjl';

export type EmscripenFS = {
  open: (name: string, opts: string) => EmscripenFSStream;
  write: (stream: EmscripenFSStream, buffer: ArrayBufferView, offset: number, length: number, position: number) => void;
  close: (stream :EmscripenFSStream) => void;
  readFile: (name: string) => Uint8Array;
}

export type EmscripenModule = {
  ccall: <T = any>(fnName: string, returnType: string, paramTypes: string[], params: any[]) => T;
  FS: EmscripenFS;
};

export declare const Module: EmscripenModule;