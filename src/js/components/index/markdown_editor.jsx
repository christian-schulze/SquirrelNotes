
import React from '../../../node_modules/react';
import _ from 'lodash';

import ipc from 'ipc';

let MarkdownEditor = React.createClass({
  getInitialState() {
    return { note: this.props.note };
  },

  componentDidMount() {
    this.saveContent = _.debounce(this._saveContent, 1000);
  },

  componentWillReceiveProps(nextProps) {
    this.setState({ note: nextProps.note });
  },

  handleOnChange(event) {
    let note = _.assign({}, this.state.note);
    note.markdownContent = event.target.value;
    this.setState({ note: note }, this.saveContent);
  },

  _saveContent() {
    ipc.send('notes.save_markdown', this.state.note);
  },

  render() {
    if (this.state.note && _.isString(this.state.note.markdownContent)) {
      return <textarea
        id="mardown-editor"
        className="form-control"
        onChange={this.handleOnChange}
        value={this.state.note.markdownContent}>
      </textarea>;
    } else if (this.state.note) {
      return <p>No markdown source, this note cannot be edited.</p>;
    } else {
      return <div />;
    }
  }
});

module.exports = MarkdownEditor;

