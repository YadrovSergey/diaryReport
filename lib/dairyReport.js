;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['fabric'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('fabric'));
  } else {
    root.DairyReport = factory(root.fabric);
  }
}(this, function(fabric) {
var DairyReport = (function () {
  'use strict';

  function isArray(val) {
    return Array.isArray(val);
  }

  function DairyReport(canvasId) {
    //var canvas = this._canvas = new fabric.Canvas(canvasId);


  }

  DairyReport.prototype = {

    _styles: {
      header: {
        fontSize: 14,
        fill: 'rgb(28, 28, 28)',
        fontFamily: 'Tahoma'
      }
    },

    _topPos: 0,

    _queue: [],

    _lines: [],

    styles: function(style) {

    },

    add: function(arr) { 
      var items = arr.items,
          self = this;

      items.map(function(item) {
        if (item.type==='header') {
          self.header(item.data);
          return;
        }
      });

    },

    header: function(data) {
      var styles;
      styles = this._styles.header;
      styles.top = this._topPos;

      var text = new fabric.Text(data, this._styles.header),
          line = new fabric.Rect({
            left: 0,
            top: text.getTop() + text.getHeight(),
            height: 2,
            width: text.getWidth(),
            fill: '#00aeb9'
          });

      line.marginBottom = 10;

      this._queue.push(text, line);
      this._lines.push(line);
    },

    draw: function(canvasId) {
      var canvas = new fabric.Canvas(canvasId),
          top = 0,
          width = 0;

      this._queue.map(function(item) {
        item.setTop(top);
        top = item.getTop() + item.getHeight();

        if (item.marginBottom) top += item.marginBottom;

        width = width > item.getWidth() ? width : item.getWidth();
        canvas.add(item);
      });

      canvas.setDimensions({ width: width });
    }

  };

  return DairyReport;
}());
return DairyReport;
}));
