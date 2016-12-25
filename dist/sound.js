$(document).ready(function(){
   $('.sound .ui.button').click(function(){
    if(stopped){
      $(this).html("<i class='icon stop'></i>Stop");
      stopped = false;
      play();
    } else {
      $(this).html("<i class='icon play'></i>Play");
      stopped = true;
    }
  });  
});

var stopped = true;

var scales = [
  {
    'scale' : 'ACOUSTIC',
    'notes' : ['C3','E3','G3','B3','D4','F#4','A4'],
    'chords' : [
      ['C3','E3','G3'],
      ['G3','B3','D4'],
      ['G3','B3','F#3','A4']
    ]
  },
  {
    'scale' : 'G_OCTATONIC',
    'notes' : ['G3','Ab3','Bb3','B3','C#4','D4','E4','F4'],
    'chords' : [
      ['G3','Ab3','E3'],
      ['Fb4','A#2','C3'],
      ['G#4','B#5','C5']
    ]
  },
  {
    'scale' : 'C_ENIGMATIC',
    'notes' : ['C3','Db3','E3','F#3','G#3','A#3','B3'],
    'chords' : [
      ['C3','E3','G#3'],
      ['C3','F#3','B4','Db4'],
      ['Db3','E3','F#3','B3']
    ]
  },
  {
    'scale' : 'A_MOLL', // A, H, C, D, E, F, G, A
    'notes' : ['A2','B2','C3','D3','E3','F3','G3','A3'],
    'chords' : [
      ['A3','C3','E3'],
      ['A4','F2','G3'],
      ['B4','C3','D3']
    ]
  }
];

var currentScale = 0;

var currentNote = 0;

var currentChord = 0;

// fire of with a timeout, or however you want.
// setTimeout(function(){
//     play(); // hit it
// },100);

function play(){
  if(!stopped){

    if(currentNote == 0 && currentChord == 0 && currentScale == 0)
      console.log(":::::::\n:::::::\n:::::::\nNEW ROUND");
    if(currentNote == 0 && currentChord == 0)
      console.log(":::::::\nSCALE: " + scales[currentScale].scale);
    if(currentNote == 0)
      console.log("CHORD: " + scales[currentScale].chords[currentChord]);
    console.log("NOTE: " + scales[currentScale].notes[currentNote]);

    var pause = 150;

    var note = getNote('sawtooth',scales[currentScale].notes[currentNote],0.2,0.1,0.9,0.4,0.1);
    note.play();

    if(currentNote == 0){
      var chord = getChord(scales[currentScale].chords[currentChord],0.1);
      chord.play();
    }

    currentNote++;
    currentNote%=scales[currentScale].notes.length;

    if(currentNote == 0){
      pause = 1000;

      currentChord++;
      currentChord%=scales[currentScale].chords.length;

      if(currentChord == 0){
        pause = 2000;

        currentScale++;
        currentScale%=scales.length;

        if(currentScale == 0){
          pause = 4000;
        }                 

      }
    }
    setTimeout(play,pause);
  }
}

function getNote(_source,_pitch,_attack,_decay,_sustain,_hold,_release){
  var note = new Wad({
      source : _source,
      pitch : _pitch,
      env : {
          attack : _attack,
          decay : _decay,
          sustain : _sustain,
          hold : _hold,
          release : _release
      }
  });
  return note;
}

function getChord(frequArray,volume){

  var chord = new Wad.Poly();

  for(var n = 0; n < frequArray.length; ++n){
    var note = getNote('square',frequArray[n],0.2,0.5,8.0,0.8,1.0);
    chord.add(note);
  }
  chord.setVolume(volume);
  return chord;
}