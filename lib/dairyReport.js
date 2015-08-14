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
    defaultCellWidth = 30;

function DairyReport(canvasId) {
  var canvas = this._canvas = new fabric.StaticCanvas(canvasId);

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
          marginBottom: 10
        }
      },
      rows: {
        fontSize: 12,
        fill: detaultTextFill,
        fontFamily: defaultFont,
        marginBottom: 3,
        line: {
          fill: '#E6E6E6',
          height: 1,
          marginBottom: 6
        }
      },
      cell: {
        fontSize: 12,
        fontFamily: defaultFont,
        width: defaultCellWidth,
        borderColor: '#E6E6E6',
        textAlign: 'center',
        width: defaultCellWidth
      }
    }
  },

  _width: 0,

  _top: 0,

  _lines: [],

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

    this.setSizes();
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
    var styles = this._styles.dairyExercise;

    this.simpleText(item.data.name, styles.name);
    
    var cells = item.data.count,
        self = this,
        top = this._top,
        titleWidth = 0,
        titleHeight = 0,
        cells = [];

    this.simpleText(' ', styles.rows);

    item.data.rows.map(function(row, i) {
      var title = new fabric.Text(row.title, styles.rows);
      titleWidth = title.getWidth() > titleWidth ? title.getWidth() : titleWidth;
      titleHeight = title.getHeight();
      self.simpleText(row.title, styles.rows);

      row.values.map(function(cell) {
        var s = styles.cell;
        s.top = self._top - titleHeight - 9;
        s.left = (cell.cell-1) * defaultCellWidth;
        cells.push(new fabric.Text(cell.value, s));
      });
    });

    var groups = [],
        end = 0,
        gObj = [];

    for (var i = 0; i < item.data.groups.length; i++) {
      gObj.push(item.data.groups[i]);

      if (item.data.groups[i+1]) {
        if (item.data.groups[i].end+1 != item.data.groups[i+1].start) {
          gObj.push({
            start: item.data.groups[i].end+1,
            end: item.data.groups[i+1].start-1
          });
        }
      }
    };

    if (item.data.groups) {
      for (var i = 0; i < item.data.count + 1; i++) {
        groups.push(0);
      }
      gObj.map(function(g) {
        groups[g.start-1] = 1;
        end = g.end;
      });

      for (var i = end; i < item.data.count + 1; i++) {
        groups[i] = 1;
        if (i!==item.data.count) gObj.push({ start: i+1, end: i+1 });
      }
    }

    var left = titleWidth + 30,
        lastLeft = 0;

    gObj.map(function(g, i) {
      var hWidth = (g.end - g.start - 1)*defaultCellWidth,
          hLeft = left + g.start*defaultCellWidth,
          hStyle = styles.cell;

      hStyle.left = hLeft;
      var header = new fabric.Text((i+1).toString(), hStyle);
      header.left += (hWidth - header.getWidth())/2;
      lastLeft = header.left;
      header.top = top;
      self._canvas.add(header);
    });

    var hStyle = styles.cell;
    hStyle.top = top;

    var totalHeader = new fabric.Text('Итог', hStyle);
    totalHeader.left = lastLeft + defaultCellWidth + defaultCellWidth/4;
    this._canvas.add(totalHeader);

    var cTop = cells[0].getTop(),
        sum = 0;
    cells.map(function(cell) {
      cell.left += left + (defaultCellWidth - cell.getWidth())/2;
      if (cell.getTop()===cTop) sum += parseInt(cell.getText());
      else {
        hStyle.top = cTop;
        hStyle.left = lastLeft + defaultCellWidth*1.25;
        var t = new fabric.Text(sum.toString(), hStyle);
        self._canvas.add(t);
        sum = parseInt(cell.getText());
        cTop = cell.getTop();
      }

      self._canvas.add(cell);
    });

    hStyle.top = cTop;
    hStyle.left = lastLeft + defaultCellWidth*1.25;
    var t = new fabric.Text(sum.toString(), hStyle);
    self._canvas.add(t);

    for (var i = 0; i < item.data.count + 1; i++) {
      var h = this._top - top - 4,
          t = top

      if (groups.length!==0 && groups[i]==0) {
        h = this._top - top - titleHeight - 7;
        t = top + titleHeight + 4;
      }

      var line = new fabric.Rect({
        width: 1,
        height: h,
        fill: '#e6e6e6',
        left: left,
        top: t
      });
      this._canvas.add(line);
      left += defaultCellWidth;
    };

    left += defaultCellWidth;

    this._width = left > this._width ? left : this._width;

    this.setSizes();
  }

};
return DairyReport;
}));
