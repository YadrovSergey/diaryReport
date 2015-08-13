;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['fabric'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('fabric'));
  } else {
    root.DairyReport = factory(root.fabric);
  }
}(this, function(fabric) {
function isArray(val) {
  return Array.isArray(val);
}

function isFunction(val) {
  return typeof(val)==='function';
}

function DairyReport(canvasId) {
  //var canvas = this._canvas = new fabric.Canvas(canvasId);


}

DairyReport.prototype = {

  _styles: {
    header: {
      fontSize: 16,
      fill: 'rgb(28, 28, 28)',
      fontFamily: 'Tahoma'
    },
    subHeader: {
      fontSize: 14,
      fill: 'rgb(28, 28, 28)',
      fontFamily: 'Tahoma'
    },
    text: {
      fontSize: 12,
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
      var method = item.type;
      if (isFunction(self[method]))
        self[method](item);
    });

  },

  header: function(item) {
    var text = new fabric.Text(item.data, this._styles.header),
        line = new fabric.Rect({
          left: 0,
          top: text.getTop() + text.getHeight(),
          height: 2,
          width: text.getWidth(),
          fill: '#00aeb9'
        });

    line.marginBottom = 10;
    line.isLine = true;

    this._queue.push(text, line);
  },

  subHeader: function(item) {
    var text = new fabric.Text(item.data, this._styles.subHeader);
    this._queue.push(text);
  },

  text: function(item) {
    var text = new fabric.Text(item.data, this._styles.text),
        self = this;

    if (item.maxWidth && text.getWidth() > item.maxWidth) {
      var words = item.data.split(' '),
          line = '',
          lines = '',
          limit = item.maxWidth;

      words.map(function(word) {
        text = new fabric.Text(line + word, self._styles.text);
        if (text.getWidth() > limit) {
          lines += line+'\n';
          line = word + ' ';
        } else {
          line += word + ' ';
        }
      });

      lines += line;
      text = new fabric.Text(lines, this._styles.text);
    }


    this._queue.push(text);
  },

  draw: function(canvasId) {
    var canvas = new fabric.StaticCanvas(canvasId),
        top = 0,
        width = 0;

    this._queue.map(function(item) {
      width = width > item.getWidth() ? width : item.getWidth();
    });

    canvas.setDimensions({ width: width });

    this._queue.map(function(item) {
      item.setTop(top);
      top = item.getTop() + item.getHeight();

      if (item.marginBottom) top += item.marginBottom;
      if (item.isLine) item.width = 400;
      canvas.add(item);
    });

    this._queue = [];

  }

};
return DairyReport;
}));
