"use strict";

let app = require('app');
let ipc = require('ipc');
let path = require('path');
let _ = require('lodash');
let TagsRepository = require('./tags_repository.js');
let NotesRepository = require('./notes_repository');
let BrowserWindow = require('browser-window');

let hl = require('highlight.js');
let md = require('markdown-it')('default', {
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  langPrefix:   'hljs-',
  highlight(str, lang) {
    if (lang && hl.getLanguage(lang)) {
      try {
        return hl.highlight(lang, str).value;
      } catch (error) {
        console.log(error);
      }
    }

    try {
      return hl.highlightAuto(str).value;
    } catch (error) {
      console.log(error);
    }

    return '';
  }
});


class NotesController {
  constructor() {
    this.tagsDbPath = path.join(app.getPath('userData'), 'tags.db');
    this.tagsRepo = new TagsRepository(this.tagsDbPath);

    this.notesPath = path.join(app.getPath('userData'), 'notes');
    this.notesRepository = new NotesRepository(this.notesPath, this.tagsRepo);
  }

  defineIpcListeners() {
    ipc.on('notes.get_list', this.getList.bind(this));
    ipc.on('notes.get_html', this.getHtml.bind(this));
    ipc.on('notes.get_markdown', this.getMarkdown.bind(this));
    ipc.on('notes.get_available_tags', this.getAvailableTags.bind(this));
    ipc.on('notes.save_markdown', this.saveMarkdown.bind(this));
    ipc.on('notes.save_tags', this.saveTags.bind(this));
  }

  getList(event, arg) {
    let notes = this.notesRepository.all();
    event.sender.send('notes_list', notes);
  }

  getHtml(event, note) {
    let content = this.notesRepository.load(note.htmlPath);
    if (_.isString(content)) {
      note.htmlContent = content;
      event.sender.send('html_content', note);
    }
  }

  getMarkdown(event, note) {
    let content = this.notesRepository.load(note.mdPath);
    if (_.isString(content)) {
      note.markdownContent = content;
      event.sender.send('markdown_content', note);
    }
  }

  getAvailableTags(event) {
    let tags = this.tagsRepo.allTags();

    let window = BrowserWindow.getFocusedWindow();
    window.webContents.send('available_tags', tags);
  }

  saveMarkdown(event, note) {
    console.log('NotesController: IPC("notes.save_markdown") received');
    if (note) {
      this.notesRepository.save(note.mdPath, note.markdownContent);
      let htmlBody = md.render(note.markdownContent);

      let htmlHead = `
      <link rel="stylesheet" href="../css/github-markdown.css">
      <link rel="stylesheet" href="../node_modules/highlight.js/styles/solarized_dark.css">
      `;

      let htmlPage = `<html>
      <head>${htmlHead}</head>
      <body class="markdown-body">${htmlBody}</body>
      </html>`;

      // if html file doesn't already exist, need to bootstrap the htmlPath here
      if (!_.isString(note.htmlPath) || !note.htmlPath.length === 0) {
        let extname = path.extname(note.mdPath);
        note.htmlPath = path.basename(note.mdPath, extname) + '.html';
      }
      this.notesRepository.save(note.htmlPath, htmlPage);

      note.htmlContent = htmlPage;

      let window = BrowserWindow.getFocusedWindow();
      window.webContents.send('html_content_changed', note);
    }
  }

  saveTags(event, note) {
    console.log('NotesController: IPC("notes.save_tags") received');
    if (note) {
      this.tagsRepo.updateTags(note.title, note.tags);

      let window = BrowserWindow.getFocusedWindow();
      window.webContents.send('tags_saved', note);
    }
  }
}

module.exports = NotesController;

