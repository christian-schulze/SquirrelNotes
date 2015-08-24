"use strict";

let RenderedNote = React.createClass({
  componentDidMount() {
    this.contentsEl = $('#contents');
    $(window).resize(this.resizeIframeHeight);
    this.resizeIframeHeight();
  },

  componentDidUpdate() {
    this.resizeIframeHeight();
  },

  resizeIframeHeight() {
    let height = this.contentsEl.height() - 35;
    $('#rendered-note').height(height);
  },

  render() {
    if (this.props.note && this.props.note.htmlContent) {
      return <iframe
        id="rendered-note"
        tabIndex="-1"
        srcDoc={this.props.note.htmlContent}>
      </iframe>;
    } else {
      return <div id="rendered-note" />;
    }
  }
});

module.exports = RenderedNote;

