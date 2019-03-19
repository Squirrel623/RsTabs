#define __STDC_CONSTANT_MACROS
#include <iostream>
#include <fstream>
#include <cstring>
#include <streambuf>
#include "wwriff.h"
#include "stdint.h"
#include "errors.h"

using namespace std;

extern "C" {
  void processWW(char* infilename, char* outfilename) {
    ifstream infile(infilename, std::ifstream::binary);
    ofstream outfile(outfilename);
    try {
        ForcePacketFormat force_packet_format(kNoForcePacketFormat);
        
        std::cout << "Created packet format" << std::endl;
        Wwise_RIFF_Vorbis ww(infile,
                    "ww2ogg/packed_codebooks_aoTuV_603.bin",
                    false,
                    false,
                    force_packet_format
                    );
        ww.generate_ogg(outfile);
        infile.close();
        outfile.close();
    } catch {
        infile.close();
        outfile.close();
    }
    
  }
}
