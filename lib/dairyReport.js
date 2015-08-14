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

var defaultFont = 'Tahoma',
    detaultTextFill = '#1c1c1c',
    cellWidth = 25;

function DairyReport(canvasId) {
  var canvas = this._canvas = new fabric.Canvas(canvasId);

}

DairyReport.prototype = {

  _styles: {
    header: {
      fontSize: 16,
      fill: detaultTextFill,
      fontFamily: defaultFont,
      line: {
        fill: '#00aeb9',
        height: 2,
        marginBottom: 10
      }
    },
    subHeader: {
      fontSize: 14,
      fill: detaultTextFill,
      fontFamily: defaultFont
    },
    text: {
      fontSize: 12,
      fill: detaultTextFill,
      fontFamily: defaultFont
    },
    blockList: {
      title: {
        fontSize: 14,
        fill: detaultTextFill,
        fontFamily: defaultFont,
        line: {
          fill: '#00aeb9',
          height: 1,
          marginBottom: 5
        }
      },
      rows: {
        fontSize: 12,
        fill: detaultTextFill,
        fontFamily: defaultFont,
        line: {
          fill: '#E6E6E6',
          height: 1,
          marginBottom: 3
        }
      }
    },
    dairyExercise: {
      name: {
        fontSize: 14,
        fill: detaultTextFill,
        fontFamily: defaultFont,
        line: {
          fill: '#00aeb9',
          height: 1,
          marginBottom: 5
        }
      },
      cell: {
        width: 25
      }
    }
  },

  _width: 0,

  _height: 0,

  _top: 0,

  _lines: [],

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

  setSizes: function() {
    var self = this;
    this._lines.map(function(line) {
      line.width = self._width;
      self._canvas.add(line);
    });

    this._canvas.setDimensions({
      width: this._width,
      height: Math.round(this._top)
    });
  },

  simpleText: function(data, styles) {
    var text = new fabric.Text(data, styles),
        self = this;

    text.setTop(this._top);
    this._canvas.add(text);

    this._top += text.getHeight();
    if (styles.marginBottom) this._top += styles.marginBottom;

    if (text.getWidth() > this._width) {
      this._width = text.getWidth();
    }

    if (styles.line) {
      var line = new fabric.Rect(styles.line);
      line.setTop(self._top);
      self._top += line.getHeight();
      if (styles.line.marginBottom) self._top += styles.line.marginBottom;
      line.isLine = true;
      this._lines.push(line);
    }

    this.setSizes();
  },

  header: function(item) {
    this.simpleText(item.data, this._styles.header);
  },

  subHeader: function(item) {
    this.simpleText(item.data, this._styles.subHeader);
  },

  text: function(item) {
    var text = new fabric.Text(item.data, this._styles.text),
        lines = item.data,
        self = this;

    if (item.maxWidth && text.getWidth() > item.maxWidth) {
      var words = lines.split(' '),
          line = '',
          limit = item.maxWidth;
      
      lines = '';

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
    }

    this.simpleText(lines, this._styles.text);
  },

  blockList: function(item) {
    var self = this;
    this.simpleText(item.data.title, this._styles.blockList.title);

    item.data.rows.map(function(row) {
      self.simpleText(row, self._styles.blockList.rows);
    });
  },

  dairyExercise: function(item) {
    this.simpleText(item.data.name, this._styles.dairyExercise.name);

    var cells = item.data.count;
  }
  
};
return DairyReport;
}));
