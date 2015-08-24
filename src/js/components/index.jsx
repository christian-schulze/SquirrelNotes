"use strict";

global.jQuery = require('jquery');
global.$ = global.jQuery;
global._ = require('lodash');
global.MessageBus = require('../lib/message_bus');
require('bootstrap');
global.React = require('../node_modules/react');

let SearchBar     = require('../js/components/index/search_bar');
let SearchResults = require('../js/components/index/search_results');
let Content       = require('../js/components/index/content');

class Index {
  render() {
    return <div>
      <SearchBar />
      <SearchResults />
      <Content />
    </div>;
  }
}

React.render(React.createElement(Index, null), document.body);

