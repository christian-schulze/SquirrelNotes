
let _ = require('lodash');
let Path = require('path');
let JetPack = require('fs-jetpack');
let fs = require('fs');

class NotesRepository {
  constructor(notesPath, tagsRepo) {
    this.notesPath = notesPath;
    this.tagsRepo = tagsRepo;
  }

  all() {
    let fileArray = JetPack.list(this.notesPath);

    let groupedNotes = _.groupBy(fileArray, function(fileName) {
      return Path.basename(fileName, Path.extname(fileName));
    });

    let noteTags = this.tagsRepo.all();

    let index = -1;
    let notes = _.map(groupedNotes, function(fileNames, basename) {
      index++;

      let note = {
        id:    index,
        title: basename,
        tags:  noteTags[basename] || []
      };

      for (let fileName of fileNames) {
        note[Path.extname(fileName).slice(1) + 'Path'] = fileName;
      }

      return note;
    });

    return notes;
  }

  load(fileName) {
    if (_.isString(fileName) && fileName.length > 0) {
      let fullFilePath = Path.join(this.notesPath, fileName);
      return JetPack.read(fullFilePath);
    } else {
      return null;
    }
  }

  save(fileName, content) {
    let fullFilePath = Path.join(this.notesPath, fileName);
    console.log(`Saving "${fullFilePath}"`);
    JetPack.write(fullFilePath, content);
  }

  create(fileName) {
    let fullFilePath = Path.join(this.notesPath, fileName);
    console.log(`Creating "${fullFilePath}"`);
    fs.writeFileSync(fullFilePath, '');
  }

  delete(fileName) {
    let fullFilePath = Path.join(this.notesPath, fileName);
    if (JetPack.exists(fullFilePath)) {
      console.log(`Deleting "${fullFilePath}"`);
      fs.unlinkSync(fullFilePath);
    }
  }

  rename(fileName, newFileName) {
    let fullFilePath = Path.join(this.notesPath, fileName);
    let newFullFilePath = Path.join(this.notesPath, newFileName);
    if (JetPack.exists(fullFilePath)) {
      console.log(`Renaming "${fullFilePath}" --> "${newFullFilePath}"`);
      fs.rename(fullFilePath, newFullFilePath);
    }
  }
}

module.exports = NotesRepository;

