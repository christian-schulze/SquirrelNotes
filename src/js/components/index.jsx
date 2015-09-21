
import jQuery from 'jquery';
global.jQuery = jQuery;
global.$ = jQuery;


import MessageBus from '../lib/message_bus';
global.MessageBus = MessageBus;

// use explicit path to avoid loading react module from parent project
import React from '../node_modules/react';

require('bootstrap');

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

