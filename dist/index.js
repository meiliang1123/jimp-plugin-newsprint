"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function spot_line(x, y) {
  return Math.abs(y);
}

function spot_round(x, y) {
  return 1 - (x * x + y * y);
}

function spot_diamond(x, y) {
  var xy = Math.abs(x) + Math.abs(y);
  /* spot only valid for 0 <= xy <= 2 */

  return (xy <= 1 ? 2 * xy * xy : 2 * xy * xy - 4 * (xy - 1) * (xy - 1)) / 4;
}

var spotfn_list = {
  "line": {
    name: '',
    fn: spot_line,
    balanced: 1
  },
  "round": {
    name: '',
    fn: spot_round,
    balanced: 1
  },
  "diamond": {
    name: '',
    fn: spot_diamond,
    balanced: 1
  }
};

function spot2thresh(type, width) {
  var wid2 = width * width; // let balanced = spotfn_list[type].balanced;

  var thresh = [];
  var spotfn = spotfn_list[type].fn;
  var order = [];
  var i = 0;

  for (var y = 0; y < width; y++) {
    for (var x = 0; x < width; x++) {
      order[i] = {};
      /* scale x & y to -1 ... +1 inclusive */

      var sx = (x / (width - 1) - 0.5) * 2;
      var sy = (y / (width - 1) - 0.5) * 2;
      var val = spotfn(sx, sy);
      val = clamp(val, -1, 1);
      /* interval is inclusive */

      order[i].index = i;
      order[i].value = val;
      i++;
    }
  } // if (!balanced)
  // {
  //     /* now sort array of (point, value) pairs in ascending order */
  //     qsort (order, wid2, sizeof (order_t), order_cmp);
  // }

  /* compile threshold matrix in order from darkest to lightest */


  for (i = 0; i < wid2; i++) {
    // if (balanced)
    thresh[order[i].index] = order[i].value * 0xfe; // else
    //     thresh[order[i].index] = i * 0xff / wid2;
  }

  return thresh;
}

function clamp(val, x, y) {
  return Math.min(Math.max(val, x), y);
}
/**
 * Applies a newsprint effect to the image without oversample
 * @param cellType cell type of the effect
 * @param cellWidth cell width of the effect
 * @param angle angle of the effect
 * @returns {Jimp} this for chaining of methods
 */


var _default = function _default() {
  return {
    newsprint: function newsprint() {
      var cellType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'line';
      var cellWidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
      var angle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -45;
      var rot = angle * Math.PI / 180;
      var x1 = 0;
      var y1 = 0;
      var x2 = this.bitmap.width;
      var y2 = this.bitmap.height;
      var thresh = spot2thresh(cellType, cellWidth, angle);

      for (var y = y1; y < y2; y += cellWidth - y % cellWidth) {
        for (var x = x1; x < x2; x += cellWidth - x % cellWidth) {
          for (var row = 0; row < cellWidth; row++) {
            for (var col = 0; col < cellWidth; col++) {
              var p1 = {
                x: x + col,
                y: y + row
              };
              var r = Math.sqrt(Math.pow(p1.x, 2) + Math.pow(p1.y, 2));
              var theta = Math.atan2(p1.y, p1.x);
              var p2 = {
                x: Math.round(r * Math.cos(theta + rot)),
                y: Math.round(r * Math.sin(theta + rot))
              };
              p2.x %= cellWidth;
              p2.y %= cellWidth;
              if (p2.x < 0) p2.x += cellWidth;
              if (p2.y < 0) p2.y += cellWidth;
              var idxThresh = p2.y * cellWidth + p2.x;
              var idx = p1.x + p1.y * this.bitmap.width << 2;
              var val = thresh[idxThresh] || 125;
              this.bitmap.data[idx] = this.bitmap.data[idx] > val ? 255 : 0;
              this.bitmap.data[idx + 1] = this.bitmap.data[idx];
              this.bitmap.data[idx + 2] = this.bitmap.data[idx];
            }
          }
        }
      }

      return this;
    }
  };
};

exports["default"] = _default;