
import React from '../../../node_modules/react';

import ipc from 'ipc';

import MarkdownEditor from './markdown_editor';
import RenderedNote from './rendered_note';

let Content = React.createClass({
  getInitialState() {
    return {
      note: null,
      selectedTabId: 'view'
    };
  },

  componentDidMount() {
    MessageBus.subscribe('NoteSelected', this.noteSelected);
    ipc.on('html_content', this.htmlContentReceived);
    ipc.on('html_content_changed', this.htmlContentChanged);
    ipc.on('markdown_content', this.markdownContentReceived);
    $('a[data-toggle="tab"]').on('click', this.handleTabClick);
  },

  noteSelected(note) {
    this.setState({ note: note }, function() {
      this.handleTabSelect(this.state.selectedTabId);
    });
  },

  htmlContentReceived(note) {
    if (note) {
      this.setState({ note: note });
    }
  },

  htmlContentChanged(note) {
    if (note && note.title === this.state.note.title) {
      this.setState({ note: note });
    }
  },

  markdownContentReceived(note) {
    if (note) {
      this.setState({ note: note });
    }
  },

  handleTabClick(event) {
    let tabId = $(event.target).attr('href').slice(1);
    this.setState({ selectedTabId: tabId }, function() {
      this.handleTabSelect(this.state.selectedTabId);
    });
  },

  handleTabSelect(tabId) {
    if (this.state.note) {
      switch(tabId) {
        case 'edit':
          ipc.send('notes.get_markdown', this.state.note);
          break;
        case 'view':
          ipc.send('notes.get_html', this.state.note);
          break;
      }
    }
  },

  maybeActive(id) {
    return this.state.selectedTabId === id ? 'active' : '';
  },

  render() {
    return <div id="contents" style={{top: '290px'}}>
      <ul className="nav nav-tabs" role="tablist">
        <li role="presentation">
          <a href="#edit" role="tab" data-toggle="tab">Edit</a>
        </li>
        <li role="presentation" className="active">
          <a href="#view" role="tab" data-toggle="tab">View</a>
        </li>
      </ul>

      <div className="tab-content">
        <div role="tabpanel" className={"tab-pane " + this.maybeActive('edit')} id="edit">
          <MarkdownEditor {...this.state}></MarkdownEditor>
        </div>
        <div role="tabpanel" className={"tab-pane " + this.maybeActive('view')} id="view">
          <RenderedNote {...this.state}></RenderedNote>
        </div>
      </div>
    </div>;
  }
});

module.exports = Content;

