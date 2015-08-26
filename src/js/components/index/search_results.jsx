"use strict";

let ipc = require('ipc');

let SearchResults = React.createClass({
  getInitialState() {
    return {
      notes:         [],
      filteredNotes: [],
      selectedNote:  null,
      editingTags:   false,
      relatedTarget: null
    };
  },

  componentDidMount() {
    ipc.send('notes.get_list', '');
    ipc.on('notes_list', (notes) => { this.notesListReceived(notes); });
    ipc.on('tags_saved', (note) => { this.tagsSaved(note); });
    MessageBus.subscribe('NextNote', (data) => { this.nextNote(); });
    MessageBus.subscribe('PreviousNote', (data) => { this.previousNote(); });
    MessageBus.subscribe('FilterNotes', (data) => { this.filterNotes(data); });
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState.editingTags === false && this.state.editingTags === true) {
      let el = React.findDOMNode(this.refs.tagsInput);
      if ($(el).not(':focus')) {
        $(el).focus();
      }
    } else if (prevState.editingTags === true && this.state.editingTags === false) {
      // if onblur originated from component outside search results div
      let searchResultsDiv = $(this.state.relatedTarget)
        .parents(`#${this.refs.searchResultsDiv.props.id}`).get(0);
      if (searchResultsDiv || this.state.relatedTarget === null) {
        let el = React.findDOMNode(this.refs.searchResultsDiv);
        $(el).focus();
      }
      this.setState({ relatedTarget: null });
    }
  },

  notesListReceived(notes) {
    this.setState({ notes: notes, filteredNotes: notes.slice() });
  },

  tagsSaved(note) {
    let state = Object.assign({}, this.state);

    let existingNote = _.find(state.notes, { 'title': note.title });
    if (existingNote) {
      existingNote.tags = note.tags;
    }

    existingNote = _.find(state.filteredNotes, { 'title': note.title});
    if (existingNote) {
      existingNote.tags = note.tags;
    }

    if (state.selectedNote && state.selectedNote.title === note.title) {
      state.selectedNote.tags = note.tags;
    }

    this.setState(state);
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

  selectNote(note) {
    if (note && (this.state.selectedNote === null || this.state.selectedNote.title !== note.title)) {
      this.setState({
        selectedNote: note,
        editingTags: false
      });
      MessageBus.publish('NoteSelected', note);
    }
  },

  keyDownHandler(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.nextNote();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.previousNote();
    }
  },

  rowSelectedClass(note) {
    if (this.state.selectedNote && this.state.selectedNote.title === note.title) {
      return 'success';
    } else {
      return '';
    }
  },

  rowClickHandler(note, event) {
    event.preventDefault();
    this.selectNote(note);
  },

  handleTagsDoubleClick(event) {
    event.preventDefault();
    if (this.state.editingTags === false) {
      this.setState({ editingTags: true });
    }
  },

  handleTagsKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleTagsBlur(event);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.setState({
        editingTags: false,
        relatedTarget: null
      });
    }
  },

  handleTagsBlur(event) {
    event.preventDefault();

    let note = Object.assign({}, this.state.selectedNote, {
      tags: React.findDOMNode(this.refs.tagsInput).value.split(' ')
    });

    this.setState({
      editingTags: false,
      relatedTarget: event.relatedTarget
    }, function() {
      ipc.send('notes.save_tags', note);
    });
  },

  renderTags(note) {
    if (this.state.editingTags === true && this.state.selectedNote && this.state.selectedNote.title === note.title) {
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
      onClick={this.rowClickHandler.bind(this, note)}>
      <td className="title" >{note.title}</td>
      <td className="tags" onDoubleClick={this.handleTagsDoubleClick}>
        {this.renderTags(note)}
      </td>
    </tr>;
  },

  renderRows() {
    return this.state.filteredNotes.map(this.renderRow);
  },

  render() {
    return <div
      ref="searchResultsDiv"
      id="search-results"
      tabIndex="2"
      onKeyDown={this.keyDownHandler}
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

