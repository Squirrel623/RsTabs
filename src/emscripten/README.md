## WWise to OGG wasm generator

The contents of this directory can be used to generate `.js` and `.wasm` files to be used on the
client side to convert a WWise sound file to an OGG sound file.

Instructions:
- Set up [emscripten sdk](https://emscripten.org/docs/getting_started/downloads.html)
- Copy the contents of this directory to the emscripten directory (e.g. .../emsdk/emscripten/1.38.20/)
- Modify the `build-ww2ogg.sh` script to output the `.js` and `.wasm` files to your desired directory
- Run `build-ww2ogg.sh`