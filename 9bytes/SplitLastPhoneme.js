// Recommended to use with UtaUtaUtau's "PhonemeToLyrics" script.
// Works by taking the last space-separated fake "phoneme" from the last note's lyrics and splitting it off.
// Splits at playhead, no note selection needed.

function getClientInfo() {
    return {
      "name" : SV.T("Split Last Phoneme"),
      "author" : "9bytes",
      "category": "9bytes",
      "versionNumber" : 1,
      "minEditorVersion" : 67840
    };
}

function getTranslations(langCode) {
    if(langCode == "ja-jp") {
      return [
        ["Split Last Phoneme", "最後音素を分割"]
      ];
    }
    if(langCode == "zh-cn") {
      return [
        ["Split Last Phoneme", "分割最后音素"]
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
    
  /////DEFINE PHONEME INFORMATION/////
  var lyrics = targetNote.getLyrics();
  var phonemes = lyrics.split(" "); // Assume space-separated phonemes.
  var lastPhoneme = phonemes.pop(); // Extract the last phoneme.
  var remainingPhonemes = phonemes.join(" "); // Remaining lyrics.
    
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
      // targetNote.setLyrics(remainingPhonemes);
      if (remainingPhonemes === "") {
        ; // skip LOL
      } else {
        targetNote.setLyrics(remainingPhonemes);
      }
      // the right note post-split.
      var splitted = SV.create("Note");
        splitted.setPitch(targetNote.getPitch());
        splitted.setTimeRange(targetNote.getEnd(), originalEnd - targetNote.getEnd());
        if (remainingPhonemes === "") {
          splitted.setLyrics("-");
        } else {
          splitted.setLyrics("." + lastPhoneme || "-");
        }
        splitted.setPitchAutoMode(0)
        group.addNote(splitted);
        selection.selectNote(splitted);
      
  }
  
  SV.finish();
}