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

function merge(json1, json2){
  var out = {};
  for(var k1 in json1){
    if (json1.hasOwnProperty(k1)) out[k1] = json1[k1];
  }
  for(var k2 in json2){
    if (json2.hasOwnProperty(k2)) {
      if(!out.hasOwnProperty(k2)) out[k2] = json2[k2];
      else if(
        (typeof out[k2] === 'object') && (out[k2].constructor === Object) && 
        (typeof json2[k2] === 'object') && (json2[k2].constructor === Object)
      ) out[k2] = merge(out[k2], json2[k2]);
    }
  }
  return out;
}

function DairyReport(canvasId) {
  //var canvas = this._canvas = new fabric.Canvas(canvasId);

}

DairyReport.prototype = {

  _styles: {
    header: {
      fontSize: 16,
      fill: '#1c1c1c',
      fontFamily: 'Tahoma',
      line: {
        fill: '#00aeb9',
        height: 2,
        marginBottom: 10
      }
    },
    subHeader: {
      fontSize: 14,
      fill: '#1c1c1c',
      fontFamily: 'Tahoma'
    },
    text: {
      fontSize: 12,
      fill: '#1c1c1c',
      fontFamily: 'Tahoma'
    },
    blockList: {
      title: {
        fontSize: 14,
        fill: '#1c1c1c',
        fontFamily: 'Tahoma',
        line: {
          fill: '#00aeb9',
          height: 1,
          marginBottom: 5
        }
      },
      rows: {
        fontSize: 12,
        fill: '#1c1c1c',
        fontFamily: 'Tahoma',
        line: {
          fill: '#E6E6E6',
          height: 1,
          marginBottom: 3
        }
      }
    }
  },

  _width: 0,

  _queue: [],

  styles: function(style) {
    this._styles = merge(style, this._styles);
  },

  add: function(obj) { 
    var items = obj.items,
        self = this;

    items.map(function(item) {
      var method = item.type;
      if (isFunction(self[method]))
        self[method](item);
    });

  },

  simpleText: function(data, styles) {
    var text = new fabric.Text(data, styles);
    if (styles.marginBottom) text.marginBottom = styles.marginBottom;

    this._queue.push(text);

    if (styles.line) {
      var line = new fabric.Rect(styles.line);
      if (styles.line.marginBottom)
        line.marginBottom = styles.line.marginBottom;
      line.isLine = true;
      this._queue.push(line);
    }
  },

  header: function(item) {
    this.simpleText(item.data, this._styles.header);
  },

  subHeader: function(item) {
    this.simpleText(item.data, this._styles.subHeader);
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

  blockList: function(item) {
    var self = this;
    this.simpleText(item.data.title, this._styles.blockList.title);

    item.data.rows.map(function(row) {
      self.simpleText(row, self._styles.blockList.rows);
    });
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
      if (item.isLine) item.width = width;
      canvas.add(item);
    });

    this._queue = [];

  }

};
return DairyReport;
}));
