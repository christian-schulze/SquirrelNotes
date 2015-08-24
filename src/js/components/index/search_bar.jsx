"use strict";

let ipc = require('ipc');
let TagsInput = require('react-tagsinput');

const KeyMessageMap = {
  'ArrowDown': 'NextNote',
  'ArrowUp':   'PreviousNote'
};

let SearchBar = React.createClass({
  getInitialState() {
    return {
      filter: '',
      selectedTags: [],
      availableTags: []
    };
  },

  componentDidMount() {
    this.filterNotes = _.debounce(function() {
      MessageBus.publish('FilterNotes', {
        filter: this.state.filter,
        selectedTags: this.state.selectedTags
      });
    },
    250);

    ipc.on('available_tags', (tags) => {
      this.setState({ availableTags: tags });
    });
    ipc.send('notes.get_available_tags');

    $('#search-bar .react-tagsinput-input').on('focus', function(event) {
      $('#search-bar .input-group').addClass('focused');
    });

    $('#search-bar .react-tagsinput-input').on('blur', function(event) {
      $('#search-bar .input-group').removeClass('focused');
    });

    $('#search-bar .react-tagsinput-input')
      .focus()
      .attr('tabindex', '1');
  },

  keyDownHandler(event) {
    if (event.key in KeyMessageMap) {
      event.preventDefault();
      MessageBus.publish(KeyMessageMap[event.key], null);
    }
  },

  searchTermChangeHandler(value) {
    this.setState({ filter: value }, this.filterNotes);
  },

  beforeTagAddHandler(tag) {
    if (this.state.availableTags.indexOf(tag) > -1) {
      return true;
    } else {
      return false;
    }
  },

  tagAddHandler(tag) {
    this.setState({
      filter: '',
      selectedTags: this.refs.tagsInput.getTags()
    },
    this.filterNotes);
  },

  tagRemoveHandler(tag) {
    this.setState({
      selectedTags: this.refs.tagsInput.getTags()
    },
    this.filterNotes);
  },

  render() {
    return <div id="search-bar">
      <div className="input-group">
        <span className="input-group-addon">
          <span className="glyphicon glyphicon-search"></span>
        </span>
        <TagsInput
          ref="tagsInput"
          onChangeInput={this.searchTermChangeHandler}
          onKeyDown={this.keyDownHandler}
          beforeTagAdd={this.beforeTagAddHandler}
          onTagAdd={this.tagAddHandler}
          onTagRemove={this.tagRemoveHandler}
          addKeys={[186]}
          addOnBlur={false} />
      </div>
    </div>;
  }
});

module.exports = SearchBar;

