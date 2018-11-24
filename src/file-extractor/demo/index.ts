import {PSARCBrowser} from '../src/index';
import { Track } from '../src/app-models/track';
import { Chord } from '../src/app-models/chord';
import { Note } from '../src/app-models/note';

function createNoteOrChordSpan(item: Note|Chord): HTMLElement {
  const div = document.createElement('div');

  if (item instanceof Note) {
    for (let i = 0; i < 6; i++) {
      const string = document.createElement('div');
      string.style.display = 'inline-block';
      if (item.String !== i) {
        string.innerText = '-';
      } else {
        string.innerText = item.Fret.toString();
      }
      div.appendChild(string);
    }
  } else if (item instanceof Chord) {
    for (let i = 0; i < 6; i++) {
      const string = document.createElement('div');
      string.style.display = 'inline-block';
      const possibleChordNote = item.Notes.find((note) => note.String === i);
      if (!possibleChordNote) {
        string.innerHTML = '-';
      } else {
        string.innerHTML = possibleChordNote.Fret.toString();
      }
      div.appendChild(string);
    }
  }

  return div;
}

function handleFiles(this: HTMLInputElement) {
  if (!this.files) {
    throw new Error('Need files');
  }

  const file = this.files.item(0);
  if (!file) {
    throw new Error('need file');
  }
 
  const reader = new FileReader();
  reader.onload = (event) => {
    const browser = new PSARCBrowser(reader.result as ArrayBuffer);
    const song = browser.getArrangement('lead');
    const track = new Track(song);

    const mainArea = document.getElementById('main');
    if (!mainArea) {
      throw new Error('need main area');
    }

    for (let measure of track.Measures) {
      const measureDiv = document.createElement('div');
      mainArea.appendChild(measureDiv);

      const notesAndChords = new Array<Chord|Note>().concat(measure.Notes).concat(measure.Chords)
        .sort((first, second) => first.Start < second.Start ? -1 : first.Start > second.Start ? 1 : 0);
      for (let noteOrChord of notesAndChords) {
        const noteOrChordSpan = document.createElement('span');
        measureDiv.appendChild(noteOrChordSpan);

        noteOrChordSpan.appendChild(createNoteOrChordSpan(noteOrChord));
      }

      const separator = document.createElement('div');
      separator.innerText = '--------------------';
      mainArea.appendChild(separator);
    }
  }

  reader.readAsArrayBuffer(file);
}

const inputElement = document.getElementById("input");
if (!inputElement) {
  throw new Error('need input');
}

inputElement.addEventListener('change', handleFiles, false)
