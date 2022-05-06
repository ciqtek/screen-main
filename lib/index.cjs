'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var electron = require('electron');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

exports.DPEnum = void 0;

(function (DPEnum) {
  DPEnum["DP_CHANGED"] = "screen-dp-changed";
  DPEnum["UPDATE_DP"] = "screen-update-dp";
})(exports.DPEnum || (exports.DPEnum = {}));

var defaultOptions = {
  initialWidth: 1600,
  initialHeight: 900,
  timeOut: 1000,
  watchValue: ['bounds', 'workArea', 'scaleFactor', 'rotation'],
  callRender: false
};

var ZoomFactor =
/** @class */
function () {
  function ZoomFactor(win, dpOptions) {
    this.changeKeyCache = new Set();
    this.win = win;
    this.dpOptions = Object.assign({}, defaultOptions, dpOptions || {});
    this.watchScreenDP();
  }

  ZoomFactor.prototype.getDisplayMatching = function () {
    return electron.screen.getDisplayMatching(this.win.getBounds());
  };

  ZoomFactor.prototype.checkDP = function () {
    var _a = this.getDisplayMatching(),
        scaleFactor = _a.scaleFactor,
        workAreaSize = _a.workAreaSize;

    var width = workAreaSize.width,
        height = workAreaSize.height;
    var _b = this.dpOptions,
        initialWidth = _b.initialWidth,
        initialHeight = _b.initialHeight;
    var ws = scaleFactor;
    var hs = scaleFactor;

    if (width < initialWidth) {
      ws = width / initialWidth;
    }

    if (height < initialHeight) {
      hs = height / initialHeight;
    }

    var res = {
      width: width,
      height: height,
      originScale: scaleFactor,
      ratio: ws > hs ? hs : ws
    };
    var preDP = this.preDP ? this.preDP : res;
    this.preDP = res;
    return __assign({
      preDP: preDP
    }, this.preDP);
  };

  ZoomFactor.prototype.watchScreenDP = function () {
    var _this = this;

    var _a = this.dpOptions,
        timeOut = _a.timeOut,
        watchValue = _a.watchValue,
        callRender = _a.callRender;
    electron.ipcMain.handle('render-process-ready', function () {
      return _this.checkDP();
    });
    electron.screen.on('display-metrics-changed', function (event, display, changedMetrics) {
      var id = _this.getDisplayMatching().id;

      if (id === display.id) {
        if (_this.timer) {
          changedMetrics.forEach(function (item) {
            return _this.changeKeyCache.add(item);
          });
          return;
        }

        _this.timer = setTimeout(function () {
          if (!changedMetrics.some(function (item) {
            return watchValue.includes(item);
          })) return;
          _this.timer = null;

          var dpMsg = _this.checkDP();

          if (callRender) {
            _this.win.webContents.send(exports.DPEnum.DP_CHANGED, dpMsg);
          }

          if (_this.dpOptions.mainCb) {
            _this.dpOptions.mainCb(dpMsg);
          }
        }, timeOut);
      }
    });
  };

  return ZoomFactor;
}();

exports.ZoomFactor = ZoomFactor;
