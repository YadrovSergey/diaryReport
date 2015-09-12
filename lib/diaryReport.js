;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['fabric'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('fabric'));
  } else {
    root.DiaryReport = factory(root.fabric);
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

function DiaryReport(canvasId) {
  var canvas = this._canvas = new fabric.StaticCanvas(canvasId);
  canvas.setBackgroundColor('#fff');
}

DiaryReport.prototype = {

  _styles: {
    header: {
      fontSize: 16,
      fill: detaultTextFill,
      fontFamily: defaultFont,
      left: 10,
      line: {
        fill: '#00aeb9',
        height: 2,
        marginBottom: 10,
        left: 10
      }
    },
    subHeader: {
      fontSize: 14,
      fill: detaultTextFill,
      fontFamily: defaultFont,
      marginBottom: 10,
      left: 10
    },
    text: {
      left: 10,
      fontSize: 12,
      fill: detaultTextFill,
      fontFamily: defaultFont,
      marginBottom: 10
    },
    blockList: {
      title: {
        fontSize: 14,
        fill: detaultTextFill,
        fontFamily: defaultFont,
        left: 10,
        line: {
          fill: '#00aeb9',
          left: 10,
          height: 1,
          marginBottom: 5
        }
      },
      rows: {
        left: 15,
        fontSize: 12,
        fill: detaultTextFill,
        fontFamily: defaultFont,
        line: {
          fill: '#E6E6E6',
          left: 15,
          height: 1,
          marginBottom: 3
        }
      }
    },
    table: {
      cell: {
        width: 25,
        height: 20
      }
    },
    diaryExercise: {
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
        textAlign: 'center'
      }
    }
  },

  _width: 0,

  _top: 10,

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
    this._top += 10;
    this._lines.map(function(line) {
      if (line.isLine) {
        line.width = self._width;
      }
      self._canvas.add(line);
    });

    this._canvas.setDimensions({
      width: this._width,
      height: Math.round(this._top)
    });
  },

  simpleText: function(data, styles, lineType) {
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
      
      if (lineType) {
        line[lineType] = true;
      } else {
        line.isLine = true;
      }
      this._lines.push(line);
    }

    return {
      width: text.getWidth(),
      height: text.getHeight()
    };
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
    var rect = new fabric.Rect({
      left: 5, top: this._top,
      width: 0, height: 10,
      fill: '#fff'
    });

    this._canvas.add(rect);
    this._top += 5;
    var s = this.simpleText(item.data.title, this._styles.blockList.title, 'blockList'),
        width = s.width,
        height = s.height;

    rect.setShadow('1px 1px 5px rgba(0,0,0,0.36)');

    item.data.rows.map(function(row) {
      var sizes = self.simpleText(row, self._styles.blockList.rows, 'blockList');
      width = width > sizes.width ? width : sizes.width;
      height += sizes.height + 3;
    });

    this._lines.map(function(line, i) {
      if (!line.blockList) return;
      self._lines[i].blockList = false;
      self._lines[i].width = width + 20;
    });

    rect.width = width + 40;
    rect.height = height + 15;
    this._top += 15;
  },

  _tableRow: function(left, top, cells) {
    var self = this,
        styles = this._styles.table.cell,
        style = { strokeWidth: 1, stroke: '#e6e6e6' },
        x = left;

    cells.map(function(cell, i) {
      x += cell.width;
      if (i!==cells.length-1) {
        var coords = [x, top, x, top + styles.height];
        self._canvas.add(new fabric.Line(coords, style));
      }

      var textStyle = self._styles.text,
          text = new fabric.Text(cell.value, textStyle);

      if (i===0) {
        text.left = x - cell.width + 5;

        if (cell.isHeader) {
          text.setColor('#1c1c1c');
        } else {
          text.setColor('#616161');
          text.left += 5;
        }
      } else {
        text.left = x - cell.width + (cell.width - text.getWidth())/2;
      }

      if (cell.color)
        text.setColor(cell.color);


      if (cell.style) {
        text.setFontStyle(cell.style);
      }

      text.top = top + styles.height - text.getHeight();
      self._canvas.add(text);
    });

    var underline = [left, top + styles.height, x, top + styles.height];
    this._canvas.add(new fabric.Line(underline, style));
    
    this._width = this._width > x ? this._width : x;
    this._top = top + styles.height;

    return {
      width: x,
      height: styles.height
    };
  },

  _textWidth: function(text, style) {
    var styles = style || this._styles.text,
        fText = new fabric.Text(text, styles);

    return fText.getWidth();
  },

  diaryExercise: function(item) {
    var self = this,
        groups = [{ width: 0, value: ' ' }],
        headerCells = [{ width: 0, value: ' ' }],
        lastGroup = 1,
        titleWidth = 0,
        tableWidth = 0,
        tableHeight = 0,
        cells = [],
        rows = [];

    var styles = this._styles.diaryExercise.name;
    styles.left = 10;
    
    var name = new fabric.Text(item.data.name, merge({
      left: 10,
      top: this._top + 5
    }, this._styles.diaryExercise.name));

    var rect = new fabric.Rect({
      left: 5, top: this._top,
      width: 0, height: 0,
      fill: '#fff'
    });

    this._top += name.getHeight();

    styles = this._styles.diaryExercise.name.line;
    styles.left = 10;
    styles.top = this._top + 5;


    var nameLine = new fabric.Rect(styles);

    if (item.data.groups.length!==0) {
      for (var i = 0; i < item.data.groups.length; i++) {
        var g = item.data.groups,
            width = (g[i].end - g[i].start + 1) * defaultCellWidth;

        groups.push({ width: width, value: lastGroup.toString() });
        lastGroup++;

        if (g[i+1] && g[i].end+1!==g[i+1].start) {
          for (var j = g[i].end+1; j < g[i+1].start; j++) {
            groups.push({ width: defaultCellWidth, value: lastGroup.toString() });
            lastGroup++;
          }
        }
      }

      for (i = item.data.groups[item.data.groups.length-1].end; i < item.data.count; i++) {
        groups.push({ width: defaultCellWidth, value: lastGroup.toString() });
        lastGroup++;
      }

    } else {
      for (var i = 0; i < item.data.count; i++) {
        groups.push({ width: defaultCellWidth, value: (i+1).toString() });
      }
    }
    
    groups.push({ width: defaultCellWidth*2, value: 'Итог' });
    
    rows.push(groups);

    item.data.rows.map(function(row) {
      titleWidth = titleWidth < self._textWidth(row.title) ? self._textWidth(row.title) : titleWidth;
      var thisRow = [{ width: 0, value: row.title }],
          sum = 0;
      
      for (var i = 0; i < item.data.count; i++) {
        thisRow.push({ width: defaultCellWidth, value: ' ' });
      }

      row.values.map(function(cell) {
        if (thisRow[cell.cell]) {
          thisRow[cell.cell].value = cell.value.toString();
          sum += parseInt(cell.value);
        }
      });
      //thisRow.push({ width: defaultCellWidth*2, value: sum.toString() });
      thisRow.push({ width: defaultCellWidth*2, value: row.total.toString() });

      rows.push(thisRow);
    });

    this._top += 5;

    rect.setShadow('1px 1px 5px rgba(0,0,0,0.36)');
    this._canvas.add(rect);

    this._canvas.add(name);
    this._canvas.add(nameLine);


    this._top += 10;
    for (i = 0; i < rows.length; i++) {
      rows[i][0].width = titleWidth + 20;
      var sizes = this._tableRow(10, this._top, rows[i]);
      rect.width = sizes.width;
      rect.height += sizes.height;
    }
    rect.height += name.getHeight() + nameLine.getHeight() + 35;
    nameLine.width = rect.getWidth() - 10;
    
    var outcome;
    if (item.data.outcomeSport) {
      outcome = new fabric.Text('Энергозатраты: '+item.data.outcomeSport+' кКал', {
        fill: '#e74c3c',
        top: this._top + 2,
        left: titleWidth + 30,
        fontSize: 12,
        fontFamily: 'Tahoma'
      });

      this._canvas.add(outcome);
    }

    this._width += 10;

    this._top += 30;
  },

  diarySuperSet: function(item) {
    var self = this,
        groups = [{ width: 0, isHeader: true, value: item.data.exercise[0].name }],
        //headerCells = [{ width: 0, value: item.data.exercise[0].rows[0].title }],
        lastGroup = 1,
        titleWidth = 0,
        tableWidth = 0,
        tableHeight = 0,
        cells = [],
        rows = [];

    var styles = this._styles.diaryExercise.name;
    styles.left = 10;
    
    var name = new fabric.Text(item.data.title, merge({
      left: 10,
      top: this._top + 5
    }, this._styles.diaryExercise.name));

    var rect = new fabric.Rect({
      left: 5, top: this._top,
      width: 0, height: 0,
      fill: '#fff'
    });

    this._top += name.getHeight();

    styles = this._styles.diaryExercise.name.line;
    styles.left = 10;
    styles.top = this._top + 5;


    var nameLine = new fabric.Rect(styles);

    if (item.data.groups.length!==0) {
      for (var i = 0; i < item.data.groups.length; i++) {
        var g = item.data.groups,
            width = (g[i].end - g[i].start + 1) * defaultCellWidth;

        groups.push({ width: width, value: lastGroup.toString() });
        lastGroup++;

        if (g[i+1] && g[i].end+1!==g[i+1].start) {
          for (var j = g[i].end+1; j < g[i+1].start; j++) {
            groups.push({ width: defaultCellWidth, value: lastGroup.toString() });
            lastGroup++;
          }
        }
      }

      for (i = item.data.groups[item.data.groups.length-1].end; i < item.data.count; i++) {
        groups.push({ width: defaultCellWidth, value: lastGroup.toString() });
        lastGroup++;
      }

    } else {
      for (var i = 0; i < item.data.count; i++) {
        groups.push({ width: defaultCellWidth, value: (i+1).toString() });
      }
    }
    groups.push({ width: defaultCellWidth*2, value: 'Итог' });
    
    rows.push(groups);

    var fullWidth = 0;

    groups.map(function(g) {
      fullWidth += g.width;
    });

    item.data.exercise.map(function(ex, i) {
      if (i!==0) {
        rows.push([{ width: fullWidth, isHeader: true, value: ex.name }]);
      }

      ex.rows.map(function(row) {
        titleWidth = titleWidth < self._textWidth(row.title) ? self._textWidth(row.title) : titleWidth;
        var thisRow = [{ width: 0, value: row.title }],
            sum = 0;
        
        for (var i = 0; i < item.data.count; i++) {
          thisRow.push({ width: defaultCellWidth, value: ' ' });
        }

        row.values.map(function(cell) {
          if (thisRow[cell.cell]) {
            thisRow[cell.cell].value = cell.value.toString();
            sum += parseInt(cell.value);
          }
        });

        //thisRow.push({ width: defaultCellWidth*2, value: sum.toString() });
        
        thisRow.push({ width: defaultCellWidth*2, value: row.total.toString() });

        rows.push(thisRow);
      });

    });


    this._top += 5;

    rect.setShadow('1px 1px 5px rgba(0,0,0,0.36)');
    this._canvas.add(rect);

    this._canvas.add(name);
    this._canvas.add(nameLine);


    this._top += 10;
    
    for (i = 0; i < rows.length; i++) {
      if (rows[i].length!==1) {
        rows[i][0].width = titleWidth + 20;
      } else {
        rows[i][0].width += titleWidth + 20;
      }
      var sizes = this._tableRow(10, this._top, rows[i]);
      rect.width = sizes.width;
      rect.height += sizes.height;
    }
    rect.height += name.getHeight() + nameLine.getHeight() + 35;
    nameLine.width = rect.getWidth() - 10;
    
    var outcome;
    if (item.data.outcomeSport) {
      outcome = new fabric.Text('Энергозатраты: '+item.data.outcomeSport+' кКал', {
        fill: '#e74c3c',
        top: this._top + 2,
        left: titleWidth + 30,
        fontSize: 12,
        fontFamily: 'Tahoma'
      });

      this._canvas.add(outcome);
    }

    this._width += 10;

    this._top += 30;
  },

  sportProgramDay: function(item) {
    var self = this,
        titleWidth = 0,
        valueWidth = 0,
        titles = [],
        values = [],
        styles = this._styles.diaryExercise.name;

    var rect = new fabric.Rect({
      left: 5, top: this._top,
      width: 0, height: 0,
      fill: '#fff'
    });

    rect.setShadow('1px 1px 5px rgba(0,0,0,0.36)');

    this._canvas.add(rect);
    this._top += 5;

    styles.left = 10;
    var headerSz = this.simpleText(item.data.name, styles, 'spdname');


    item.data.rows.map(function(row) {
      var title = new fabric.Text(row.title, self._styles.text),
          value = new fabric.Text(row.value, self._styles.text);

      if (row.number!=='')
        title.number = row.number;

      titleWidth = titleWidth > title.getWidth() ? titleWidth : title.getWidth();
      valueWidth = valueWidth > value.getWidth() ? valueWidth : value.getWidth();
      titles.push(title);
      values.push(value);
    });

    var lineStyle = { stroke: '#e6e6e6', strokeWidth: 1 },
        leftOffset = 30,
        totalWidth = 0,
        totalHeight = headerSz.height;

    titles.map(function(title, i) {
      self._canvas.add(titles[i]);
      titles[i].left = leftOffset;
      titles[i].top = self._top;
      var lineTop = self._top + title.getHeight();
      var tLine = new fabric.Line([leftOffset, lineTop, titleWidth+leftOffset, lineTop], lineStyle);
      self._canvas.add(tLine);

      if (title.number) {
        var number = new fabric.Text(title.number, self._styles.text);
        number.left = leftOffset - 15;
        number.top = self._top;
        self._canvas.add(number);        
      }

      self._canvas.add(values[i]);
      values[i].left = titleWidth + leftOffset*2 + (valueWidth - values[i].getWidth())/2;
      values[i].top = self._top;
      var vLine = new fabric.Line([titleWidth+leftOffset*2, lineTop, valueWidth+titleWidth+leftOffset*2, lineTop], lineStyle);
      self._canvas.add(vLine);

      self._top += titles[i].getHeight() + 6;
      totalHeight += title.getHeight() + 10;

      if (i===0) {
        totalWidth = titleWidth + valueWidth + leftOffset*2;
      }
    });

    this._lines.map(function(line, i) {
      if (line.spdname) {
        self._lines[i].spdname = false;
        self._lines[i].width = totalWidth;
      }
    });

    rect.width = totalWidth + 10;
    rect.height = totalHeight;
    this._top += 10;
  },

  diaryFood: function(item) {
    var self = this;
    this._top += 10;
    var styles = this._styles.diaryExercise.name;
    styles.left = 10;

    var rect = new fabric.Rect({
      left: 5, top: this._top,
      width: 480, height: 50,
      fill: '#fff'
    });

    rect.setShadow('1px 1px 5px rgba(0,0,0,0.36)');

    this._canvas.add(rect);
    this._top += 5;

    var tSize = this.simpleText(item.data.title, styles, 'food');
    var rows = [ [{
        width: 210, value: ' '
      }, {
        width: 50, value: 'Кол.'
      }, {
        width: 50, value: 'Калор.'
      }, {
        width: 50, value: 'Белки'
      }, {
        width: 50, value: 'Жиры'
      }, {
        width: 50, value: 'Углев.'
      }] ];

    this._lines.map(function(line, i) {
      if (line.food) {
        line.food = false;
        self._lines[i].width = 460;
      }
    });

    var totalHeight = 0;

    item.data.rows.map(function(row) {
      var cells = [];

      if (row.title) {
        cells.push({ value: row.title, width: 210, color: '#1c1c1c' });
      } else {
        if (row.isTotal) cells.push({ value: "Итого", width: 210, color: '#1c1c1c', style: 'italic' });
      }

      row.values.map(function(val) {
        var text = val===0 ? ' ' : val.toString();
        cells.push({ value: text, width: 50 });
      });


      rows.push(cells);
    });
    totalHeight = self._styles.table.cell.height * rows.length + 40;

    rect.height = totalHeight;

    rows.map(function(row) {
      self._tableRow(10, self._top, row);
    });

    this._top += 10;
  },

  _mzrLine: function(data, width) {
    var labelWidth = 100,
        self = this,
        label = new fabric.Text(data.label, {
          fontFamily: defaultFont,
          fontSize: 12,
          top: this._top+10
        });

    label.left = (labelWidth - label.getWidth())/2;

    var perc = new fabric.Text(data.percent, {
      fontFamily: defaultFont,
      fontSize: 12,
      top: this._top + 20,
      left: width - 50
    });

    this._canvas.add(perc);

    var line1 = new fabric.Rect({
      left: labelWidth,
      width: 1,
      height: 40,
      top: this._top+5,
      fill: '#999'
    });

    var lineWidth = width - labelWidth - 60;

    var line2 = new fabric.Rect({
      left: labelWidth,
      top: this._top + 25,
      width: lineWidth,
      height: 1,
      fill: '#999'
    });

    var barWidth = lineWidth * data.barPercent / 100;

    var bar = new fabric.Rect({
      left: labelWidth + 1,
      top: this._top + 10,
      height: 15,
      width: barWidth - 1,
      fill: data.barColor
    });

    bar.setShadow('1px 1px 5px rgba(0,0,0,0.36)');


    this._canvas.add(line1);
    this._canvas.add(line2);
    this._canvas.add(bar);

    data.tags.map(function(tag) {
      var tagLeft = labelWidth + lineWidth * tag.percent / 100;
      var l = new fabric.Rect({
        width: 1,
        height: 9,
        fill: '#999',
        left: tagLeft,
        top: self._top + 21
      });

      var tagLabel = new fabric.Text(tag.value, {
        fontFamily: defaultFont,
        fontSize: 11,
        top: self._top + 10
      });

      tagLabel.left = tagLeft - (tagLabel.getWidth() / 2);

      self._canvas.add(l);
      self._canvas.add(tagLabel);
    });

    this._canvas.add(label);
    this._top += label.getHeight() + 10;

    var value = new fabric.Text(data.value, {
      fontFamily: defaultFont,
      fontSize: 10,
      fontWeight: 'bold',
      top: this._top
    });
    value.left = (labelWidth - value.getWidth())/2;
    this._canvas.add(value);


    this._top += value.getHeight();
  },

  macronutrients: function(item) {
    var self = this;

    this._top += 10;
    
    var rect = new fabric.Rect({
      left: 5, top: this._top,
      width: item.data.width, height: 50,
      fill: '#fff'
    });

    var topStart = this._top;

    rect.setShadow('1px 1px 5px rgba(0,0,0,0.36)');
    
    var mainRect = new fabric.Rect({
      left: 5, top: this._top,
      width: item.data.width, height: 100,
      fill: '#fff'
    });

    mainRect.setShadow('1px 1px 5px rgba(0,0,0,0.36)');

    this._canvas.add(mainRect);

    this._canvas.add(rect);

    var text = new fabric.Text(item.data.header, {
      top: this._top + 18,
      fontFamily: 'Tahoma',
      fontSize: 12,
      fontWeight: 'bold',
      fill: '#00AEB9'
    });

    var left = (item.data.width - text.getWidth())/2;
    text.left = left;

    this._canvas.add(text);
    this._top += 60;

    item.data.nutrients.map(function(nut) {
      self._mzrLine(nut, item.data.width);
    });

    this._top += 15;
    mainRect.height = this._top - topStart;


  }

};
return DiaryReport;
}));
