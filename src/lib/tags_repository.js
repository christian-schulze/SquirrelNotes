"use strict";

let _ = require('lodash');
let Loki = require('lokijs');

class TagsRepository {
  constructor(dbPath) {
    this.dbPath = dbPath;

    this.db = new Loki(this.dbPath, {
      autosave: true,
      autoload: true,
      autoloadCallback: this._autoLoadCallback.bind(this)
    });

    this.db.loadDatabase({}, function() {
      this._ensureNotesCollectionExists();
    }.bind(this));
  }

  all() {
    return _.reduce(this.db.getCollection('notes').data, function(notes, note) {
      notes[note.title] = note.tags;
      return notes;
    }, {});
  }

  delete(noteTitle) {
    let notesCollection = this.db.getCollection('notes');

    let note = null;
    if (notesCollection.data.length > 0) {
      note = notesCollection.by('title', noteTitle);
    }

    if (note !== null && note !== undefined) {
      console.log(`deleting(title: "${noteTitle}")`);
      notesCollection.remove(note);
    }
  }

  rename(noteTitle, newNoteTitle) {
    let notesCollection = this.db.getCollection('notes');

    let note = null;
    if (notesCollection.data.length > 0) {
      note = notesCollection.by('title', noteTitle);
    }

    if (note !== null && note !== undefined) {
      console.log(`renaming(title: "${noteTitle}") { title: "${newNoteTitle}" }`);
      note.title = newNoteTitle;
      notesCollection.update(note);
    }
  }

  allTags() {
    return _.reduce(this.db.getCollection('notes').data, function(tags, note) {
      return _.union(tags, note.tags);
    }, []);
  }

  updateTags(noteTitle, tags = []) {
    let notesCollection = this.db.getCollection('notes');

    let note = null;
    if (notesCollection.data.length > 0) {
      note = notesCollection.by('title', noteTitle);
    }

    if (note !== null && note !== undefined) {
      console.log(`updating(title: "${noteTitle}") { tags: ${tags} }`);
      note.tags = tags;
      notesCollection.update(note);
    } else {
      console.log(`inserting(title: "${noteTitle}") { tags: ${tags} }`);
      notesCollection.insert({ title: noteTitle, tags: tags});
    }
    this.db.saveDatabase();
  }

  _autoLoadCallback() {
    //this.db.getCollection('notes').ensureUniqueIndex('title');
  }

  _ensureNotesCollectionExists() {
    let notesCollection = this.db.getCollection('notes');
    if (notesCollection === null) {
      this.db.addCollection('notes', ['title']);
      this.db.saveDatabase();
    }
  }
}

module.exports = TagsRepository;

