/* global Fuse:false */
"use strict";

let ipc = require('ipc');

const EditingState = {
  NOTHING: null,
  TITLE: 'title',
  TAGS: 'tags',
  NEWNOTE: 'newnote'
};

let SearchResults = React.createClass({
  getInitialState() {
    return {
      notes:         [],
      filteredNotes: [],
      selectedNote:  null,
      editingState:  EditingState.NOTHING,
      relatedTarget: null
    };
  },

  componentDidMount() {
    ipc.send('notes.get_list', '');
    ipc.on('notes_list', (notes) => { this.notesListReceived(notes); });
    ipc.on('tags_saved', (note) => { this.tagsSaved(note); });
    ipc.on('note_created', (title) => { this.noteCreated(title); });
    ipc.on('note_deleted', (note) => { this.noteDeleted(note); });
    ipc.on('note_renamed', (note) => { this.noteRenamed(note); });
    ipc.on('NewNote', (data) => { this.newNote(); });
    ipc.on('DeleteNote', (data) => { this.deleteSelectedNote(); });
    ipc.on('RenameNote', (data) => { this.renameSelectedNote(); });
    MessageBus.subscribe('NextNote', (data) => { this.nextNote(); });
    MessageBus.subscribe('PreviousNote', (data) => { this.previousNote(); });
    MessageBus.subscribe('FilterNotes', (data) => { this.filterNotes(data); });
    MessageBus.subscribe('NewNote', (data) => { this.newNote(); });
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState.editingState !== EditingState.TITLE && this.state.editingState === EditingState.TITLE) {
      let el = React.findDOMNode(this.refs.titleInput);
      if ($(el).not(':focus')) {
        $(el).focus();
      }
    } else if (prevState.editingState === EditingState.TITLE && this.state.editingState === EditingState.NOTHING) {
      // if onblur originated from component outside search results div
      let searchResultsDiv = $(this.state.relatedTarget)
        .parents(`#${this.refs.searchResultsDiv.props.id}`).get(0);
      if (searchResultsDiv || this.state.relatedTarget === null) {
        let el = React.findDOMNode(this.refs.searchResultsDiv);
        $(el).focus();
      }
      this.setState({ relatedTarget: null });
    } else if (prevState.editingState !== EditingState.TAGS && this.state.editingState === EditingState.TAGS) {
      let el = React.findDOMNode(this.refs.tagsInput);
      if ($(el).not(':focus')) {
        $(el).focus();
      }
    } else if (prevState.editingState === EditingState.TAGS && this.state.editingState === EditingState.NOTHING) {
      // if onblur originated from component outside search results div
      let searchResultsDiv = $(this.state.relatedTarget)
        .parents(`#${this.refs.searchResultsDiv.props.id}`).get(0);
      if (searchResultsDiv || this.state.relatedTarget === null) {
        let el = React.findDOMNode(this.refs.searchResultsDiv);
        $(el).focus();
      }
      this.setState({ relatedTarget: null });
    } else if (prevState.editingState !== EditingState.NEWNOTE && this.state.editingState === EditingState.NEWNOTE ) {
      let el = React.findDOMNode(this.refs.newNoteInput);
      if ($(el).not(':focus')) {
        $(el).focus();
      }
    }
  },

  notesListReceived(notes) {
    this.setState({ notes: notes, filteredNotes: notes.slice() });
  },

  tagsSaved(note) {
    if (this.state.editingState === EditingState.TAGS && this.state.selectedNote && this.state.selectedNote.title === note.title) {
      this.setState({ editingState: EditingState.NOTHING });
    }
    ipc.send('notes.get_list', '');
  },

  noteCreated(title) {
    this.setState({ editingState: EditingState.NOTHING });
    ipc.send('notes.get_list', '');
  },

  noteDeleted(note) {
    if (this.state.selectedNote && this.state.selectedNote.title === note.title) {
      this.setState({ selectedNote: null });
    }
    ipc.send('notes.get_list', '');
  },

  noteRenamed(note) {
    if (this.state.editingState === EditingState.TITLE && this.state.selectedNote && this.state.selectedNote.title === note.title) {
      this.setState({ editingState: EditingState.NOTHING });
    }
    ipc.send('notes.get_list', '');
  },

  filterNotes(data) {
    if (data.selectedTags.length > 0 || data.filter.length > 0) {
      let notes = this.state.notes.slice();

      if (data.selectedTags.length > 0) {
        notes = _.filter(notes, (note) => {
          return _.all(data.selectedTags, (tag) => {
            return note.tags.indexOf(tag) > -1;
          });
        });
      }

      if (data.filter.length > 0) {
        let fuse = new Fuse(notes, { keys: ['title'] });
        notes = fuse.search(data.filter);
      }

      this.setState({ filteredNotes: notes });
      if (this.state.selectedNote && !_.find(notes, { 'title': this.state.selectedNote.title })) {
        this.setState({ selectedNote: null });
      }
    } else {
      this.setState({ filteredNotes: this.state.notes.slice() });
    }
  },

  nextNote() {
    if (this.state.selectedNote === null && this.state.filteredNotes.length > 0) {
      this.selectNote(this.state.filteredNotes[0]);
    } else if (this.state.selectedNote !== null && this.state.filteredNotes.length > 0 && this.state.filteredNotes.indexOf(this.state.selectedNote) < this.state.filteredNotes.length - 1) {
      let note = this.state.filteredNotes[this.state.filteredNotes.indexOf(this.state.selectedNote) + 1];
      this.selectNote(note);
    }
  },

  previousNote() {
    if (this.state.selectedNote !== null && this.state.filteredNotes.length > 0 && this.state.filteredNotes.indexOf(this.state.selectedNote) > 0) {
      let note = this.state.filteredNotes[this.state.filteredNotes.indexOf(this.state.selectedNote) - 1];
      this.selectNote(note);
    }
  },

  newNote() {
    if (this.state.editingState !== EditingState.NEWNOTE) {
      this.setState({
        selectedNote: null,
        editingState: EditingState.NEWNOTE
      });
    }
  },

  deleteSelectedNote() {
    if (this.state.selectedNote !== null && this.state.editingState === EditingState.NOTHING) {
      ipc.send('notes.delete_note', this.state.selectedNote);
    }
  },

  renameSelectedNote() {
    if (this.state.selectedNote !== null && this.state.editingState === EditingState.NOTHING) {
      this.setState({ editingState: EditingState.TITLE });
    }
  },

  selectNote(note) {
    if (note && (this.state.selectedNote === null || this.state.selectedNote.title !== note.title)) {
      this.setState({
        selectedNote: note,
        editingState: EditingState.NOTHING
      });
      MessageBus.publish('NoteSelected', note);
    }
  },

  rowSelectedClass(note) {
    if (this.state.selectedNote && this.state.selectedNote.title === note.title) {
      return 'success';
    } else {
      return '';
    }
  },

  handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.nextNote();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.previousNote();
    }
  },

  handleRowClick(note, event) {
    event.preventDefault();
    this.selectNote(note);
  },

  handleTitleDoubleClick(event) {
    event.preventDefault();
    if (this.state.editingState !== EditingState.TITLE) {
      this.setState({ editingState: EditingState.TITLE });
    }
  },

  handleTitleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      let newTitle = React.findDOMNode(this.refs.titleInput).value;
      ipc.send('notes.rename_note', this.state.selectedNote, newTitle);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.setState({
        editingState: EditingState.NOTHING,
        relatedTarget: null
      });
    }
  },

  handleTitleBlur(event) {
    event.preventDefault();
    this.setState({
      editingState: EditingState.NOTHING,
      relatedTarget: event.relatedTarget
    });
  },

  handleTagsDoubleClick(event) {
    event.preventDefault();
    if (this.state.editingState !== EditingState.TAGS) {
      this.setState({ editingState: EditingState.TAGS });
    }
  },

  handleTagsKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      let note = Object.assign({}, this.state.selectedNote, {
        tags: React.findDOMNode(this.refs.tagsInput).value.split(' ')
      });
      ipc.send('notes.save_tags', note);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.setState({
        editingState: EditingState.NOTHING,
        relatedTarget: null
      });
    }
  },

  handleTagsBlur(event) {
    event.preventDefault();
      this.setState({
        editingState: EditingState.NOTHING,
        relatedTarget: event.relatedTarget
      });
  },

  handleNewNoteKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      let el = React.findDOMNode(this.refs.newNoteInput);
      ipc.send('notes.create_note', el.value);
    } if (event.key === 'Escape') {
      event.preventDefault();
      this.setState({
        editingState: EditingState.NOTHING,
        relatedTarget: null
      });
    }
  },

  handleNewNoteBlur() {
    this.setState({ editingState: EditingState.NOTHING });
  },

  renderNewNote() {
    return <tr key="newNote" className="success">
      <td className="title">
        <input ref="newNoteInput"
          type="text"
          defaultValue=""
          onBlur={this.handleNewNoteBlur}
          onKeyDown={this.handleNewNoteKeyDown} />
      </td>
      <td className="tags"></td>
    </tr>;
  },

  renderTitle(note) {
    if (this.state.editingState === EditingState.TITLE && this.state.selectedNote && this.state.selectedNote.title === note.title) {
      return <input
        ref="titleInput"
        type="text"
        defaultValue={note.title}
        onBlur={this.handleTitleBlur}
        onKeyDown={this.handleTitleKeyDown} />;
    } else {
      return note.title;
    }
  },

  renderTags(note) {
    if (this.state.editingState === EditingState.TAGS && this.state.selectedNote && this.state.selectedNote.title === note.title) {
      return <input
        ref="tagsInput"
        type="text"
        defaultValue={note.tags.join(' ')}
        onBlur={this.handleTagsBlur}
        onKeyDown={this.handleTagsKeyDown} />;
    } else {
      let tagElements = note.tags.map((tag, index) => {
        return <span key={index} style={{padding: '0 1px 1px 0'}}>
          <span className="label label-success">{tag}</span>
        </span>;
      });

      return tagElements;
    }
  },

  renderRow(note) {
    return <tr
      key={note.title}
      className={this.rowSelectedClass(note)}
      onClick={this.handleRowClick.bind(this, note)}>
      <td className="title" onDoubleClick={this.handleTitleDoubleClick}>
        {this.renderTitle(note)}
      </td>
      <td className="tags" onDoubleClick={this.handleTagsDoubleClick}>
        {this.renderTags(note)}
      </td>
    </tr>;
  },

  renderRows() {
    let rows = [];

    if (this.state.editingState === EditingState.NEWNOTE) {
      rows.push(this.renderNewNote());
    }

    rows = rows.concat(this.state.filteredNotes.map(this.renderRow));

    return rows;
  },

  render() {
    return <div
      ref="searchResultsDiv"
      id="search-results"
      tabIndex="2"
      onKeyDown={this.handleKeyDown}
      style={{height: '250px'}}>
      <table className="table table-striped table-hover table-condensed">
        <thead>
          <th>Title</th>
          <th>Tags</th>
        </thead>
        <tbody>
          {this.renderRows()}
        </tbody>
      </table>
    </div>;
  }
});

module.exports = SearchResults;

