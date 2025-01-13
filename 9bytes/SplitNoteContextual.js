/*An updated version of the SplitSelectedNotes plugin from https://github.com/Dreamtonics/svstudio-scripts/blob/master/Utilities/SplitSelectedNotes.js
Made to actually work with Pitch Modes and Auto-Pitch Tuning since... y'know...
...Dreamtonics hasn't updated their plugins OR their scripting manual in 5 years.
...I'm not bitter ^^*/

// just splits note at the playhead, regardless of selection
// preserves pitch mode and auto-pitch toggle of original note

function getClientInfo() {
  return {
    "name" : SV.T("Split Note (Contextual)"),
    "author" : "9bytes",
    "category": "9bytes",
    "versionNumber" : 1,
    "minEditorVersion" : 67840
  };
}

function getTranslations(langCode) {
  if(langCode == "ja-jp") {
    return [
      ["Split Note (Contextual)", "ノートを分割 (文脈依存)"]
    ];
  }

  if(langCode == "zh-cn") {
    return [
      ["Split Note (Contextual)", "分割音符 (基于语境)"]
    ];
  }
  return [];
}

function main() {
  /////FETCH SELECTION/////
  var selection = SV.getMainEditor().getSelection();
  var scope = SV.getMainEditor().getCurrentGroup();
  var group = scope.getTarget();


  /////FETCH PLAYHEAD LOCATION/////
  var playhead = SV.getPlayback().getPlayhead();
  var timeAxis = SV.getProject().getTimeAxis();
  var playheadBlicks = timeAxis.getBlickFromSeconds(playhead)
    - scope.getTimeOffset();

  /////FETCH SELECTED NOTES/////
  var selectedNotes = [];
  for (var i=0; i < group.getNumNotes(); i++) {
    selectedNotes.push(group.getNote(i));
  }

  /////TARGET NOTES////
  for(var i = 0; i < selectedNotes.length; i++) {
    var targetNote = selectedNotes[i];
    var originalOnset = targetNote.getOnset();
    var originalEnd = targetNote.getEnd();
    var fullDuration = targetNote.getDuration();
    var originalMusicalType = targetNote.getMusicalType();
    var originalPitchAutoMode = targetNote.getPitchAutoMode();
  
    /////SELECTIVE EDIT/////
    // skip notes that the playhead isn't in.
    if(!(playheadBlicks > originalOnset && playheadBlicks < originalEnd))
      continue;
     // skip very short notes.
   if(fullDuration < SV.QUARTER / 16)
       continue;
  
   /////SPLITTING/////
    // split in the middle of the note by default (redundant).
    var durationLeft = Math.round(targetNote.getDuration() / 2);
    // split at playhead position.
    if(playheadBlicks > originalOnset && playheadBlicks < originalEnd)
       durationLeft = playheadBlicks - originalOnset;
  
    
    /////OUTPUT/////
    // the left note post-split.
    targetNote.setDuration(durationLeft);
    // the right note post-split
    var splitted = SV.create("Note");
    splitted.setPitch(targetNote.getPitch());
    splitted.setTimeRange(targetNote.getEnd(), originalEnd - targetNote.getEnd());
    splitted.setLyrics("-");
    splitted.setPitchAutoMode(originalPitchAutoMode);
    splitted.setMusicalType(originalMusicalType);
    group.addNote(splitted);
    selection.selectNote(splitted);
  }

  SV.finish();
}