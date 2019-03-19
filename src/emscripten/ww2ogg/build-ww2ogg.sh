./emcc ww2ogg/src/ww2ogg.cpp -c
./emcc ww2ogg/src/wwriff.cpp -c
./emcc ww2ogg/src/codebook.cpp -c
./emcc ww2ogg/src/crc.c -c
./emcc ww2ogg.o wwriff.o codebook.o crc.o -o combined_ww2ogg.o
./emcc combined_ww2ogg.o -o output/ -s DISABLE_EXCEPTION_CATCHING=0 --embed-file ww2ogg/packed_codebooks_aoTuV_603.bin -s EXPORTED_FUNCTIONS="[''processWW']" -s WASM=1 -s "BINARYEN_METHOD='native-wasm'"