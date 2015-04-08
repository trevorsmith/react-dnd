'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

exports.__esModule = true;

var _DragSource3 = require('dnd-core');

var _NativeTypes = require('../NativeTypes');

var _NativeTypes2 = _interopRequireWildcard(_NativeTypes);

var _EnterLeaveCounter = require('../utils/EnterLeaveCounter');

var _EnterLeaveCounter2 = _interopRequireWildcard(_EnterLeaveCounter);

var _shallowEqual = require('../utils/shallowEqual');

var _shallowEqual2 = _interopRequireWildcard(_shallowEqual);

var _invariant = require('react/lib/invariant');

var _invariant2 = _interopRequireWildcard(_invariant);

var _warning = require('react/lib/warning');

var _warning2 = _interopRequireWildcard(_warning);

function isUrlDataTransfer(dataTransfer) {
  var types = Array.prototype.slice.call(dataTransfer.types);
  return types.indexOf('Url') > -1 || types.indexOf('text/uri-list') > -1;
}

function isFileDataTransfer(dataTransfer) {
  var types = Array.prototype.slice.call(dataTransfer.types);
  return types.indexOf('Files') > -1;
}

function getMouseEventOffsets(e, sourceNode, dragPreview) {
  var dragPreviewNode = dragPreview instanceof Image ? sourceNode : dragPreview;

  var sourceNodeRect = sourceNode.getBoundingClientRect();
  var dragPreviewNodeRect = dragPreviewNode.getBoundingClientRect();

  var offsetFromClient = {
    x: e.clientX,
    y: e.clientY
  };
  var offsetFromDragPreview = {
    x: e.clientX - dragPreviewNodeRect.left,
    y: e.clientY - dragPreviewNodeRect.top
  };
  var offsetFromSource = {
    x: e.clientX - sourceNodeRect.left,
    y: e.clientY - sourceNodeRect.top
  };

  return { offsetFromClient: offsetFromClient, offsetFromSource: offsetFromSource, offsetFromDragPreview: offsetFromDragPreview };
}

function isDesktopSafari() {
  return !!window.safari;
}

function isFirefox() {
  return /firefox/i.test(navigator.userAgent);
}

function getDragPreviewOffset(sourceNode, dragPreview, offsetFromDragPreview) {
  var sourceWidth = sourceNode.offsetWidth;
  var sourceHeight = sourceNode.offsetHeight;

  var isImage = dragPreview instanceof Image;

  var dragPreviewWidth = isImage ? dragPreview.width : sourceWidth;
  var dragPreviewHeight = isImage ? dragPreview.height : sourceHeight;
  var x = offsetFromDragPreview.x;
  var y = offsetFromDragPreview.y;

  // Work around @2x coordinate discrepancies in browsers
  if (isDesktopSafari() && isImage) {
    dragPreviewHeight /= window.devicePixelRatio;
    dragPreviewWidth /= window.devicePixelRatio;
  } else if (isFirefox() && !isImage) {
    dragPreviewHeight *= window.devicePixelRatio;
    dragPreviewWidth *= window.devicePixelRatio;
  }

  // Scale to translate coordinates to preview size
  x *= dragPreviewWidth / sourceWidth;
  y *= dragPreviewHeight / sourceHeight;

  // Work around Safari 8 positioning bug
  if (isDesktopSafari() && isImage) {
    // We'll have to wait for @3x to see if this is entirely correct
    y += (window.devicePixelRatio - 1) * dragPreviewHeight;
  }

  return { x: x, y: y };
}

var ELEMENT_NODE = 1;

function getElementRect(el) {
  if (el.nodeType !== ELEMENT_NODE) {
    el = el.parentElement;
  }

  if (!el) {
    return null;
  }

  var _el$getBoundingClientRect = el.getBoundingClientRect();

  var top = _el$getBoundingClientRect.top;
  var left = _el$getBoundingClientRect.left;
  var width = _el$getBoundingClientRect.width;
  var height = _el$getBoundingClientRect.height;

  return { top: top, left: left, width: width, height: height };
}

var FileDragSource = (function (_DragSource) {
  function FileDragSource() {
    _classCallCheck(this, FileDragSource);

    _DragSource.call(this);
    this.item = Object.defineProperties({}, {
      files: {
        get: function () {
          _warning2['default'](false, 'Browser doesn\'t allow reading file information until the files are dropped.');
          return null;
        },
        configurable: true,
        enumerable: true
      }
    });
  }

  _inherits(FileDragSource, _DragSource);

  FileDragSource.prototype.mutateItemByReadingDataTransfer = function mutateItemByReadingDataTransfer(dataTransfer) {
    delete this.item.files;
    this.item.files = Array.prototype.slice.call(dataTransfer.files);
  };

  FileDragSource.prototype.beginDrag = function beginDrag() {
    return this.item;
  };

  return FileDragSource;
})(_DragSource3.DragSource);

var UrlDragSource = (function (_DragSource2) {
  function UrlDragSource() {
    _classCallCheck(this, UrlDragSource);

    _DragSource2.call(this);
    this.item = Object.defineProperties({}, {
      urls: {
        get: function () {
          _warning2['default'](false, 'Browser doesn\'t allow reading URL information until the link is dropped.');
          return null;
        },
        configurable: true,
        enumerable: true
      }
    });
  }

  _inherits(UrlDragSource, _DragSource2);

  UrlDragSource.prototype.mutateItemByReadingDataTransfer = function mutateItemByReadingDataTransfer(dataTransfer) {
    delete this.item.urls;
    this.item.urls = (dataTransfer.getData('Url') || dataTransfer.getData('text/uri-list') || '').split('\n');
  };

  UrlDragSource.prototype.beginDrag = function beginDrag() {
    return this.item;
  };

  return UrlDragSource;
})(_DragSource3.DragSource);

var HTML5Backend = (function () {
  function HTML5Backend(actions, monitor, registry) {
    _classCallCheck(this, HTML5Backend);

    this.actions = actions;
    this.monitor = monitor;
    this.registry = registry;

    this.sourcePreviewNodes = {};
    this.sourceNodeOptions = {};
    this.enterLeaveCounter = new _EnterLeaveCounter2['default']();

    this.handleTopDragStart = this.handleTopDragStart.bind(this);
    this.handleTopDragStartCapture = this.handleTopDragStartCapture.bind(this);
    this.handleTopDragEnd = this.handleTopDragEnd.bind(this);
    this.handleTopDragEndCapture = this.handleTopDragEndCapture.bind(this);
    this.handleTopDragEnter = this.handleTopDragEnter.bind(this);
    this.handleTopDragEnterCapture = this.handleTopDragEnterCapture.bind(this);
    this.handleTopDragLeave = this.handleTopDragLeave.bind(this);
    this.handleTopDragLeaveCapture = this.handleTopDragLeaveCapture.bind(this);
    this.handleTopDragOver = this.handleTopDragOver.bind(this);
    this.handleTopDragOverCapture = this.handleTopDragOverCapture.bind(this);
    this.handleTopDrop = this.handleTopDrop.bind(this);
    this.handleTopDropCapture = this.handleTopDropCapture.bind(this);
    this.endDragIfSourceWasRemovedFromDOM = this.endDragIfSourceWasRemovedFromDOM.bind(this);
    this.connectSourceNode = this.connectSourceNode.bind(this);
    this.connectSourcePreviewNode = this.connectSourcePreviewNode.bind(this);
    this.connectTargetNode = this.connectTargetNode.bind(this);
  }

  HTML5Backend.prototype.setup = function setup() {
    _invariant2['default'](!this.constructor.isSetUp, 'Cannot have two HTML5 backends at the same time.');
    this.constructor.isSetUp = true;

    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('dragstart', this.handleTopDragStart);
    window.addEventListener('dragstart', this.handleTopDragStartCapture, true);
    window.addEventListener('dragend', this.handleTopDragEnd);
    window.addEventListener('dragend', this.handleTopDragEndCapture, true);
    window.addEventListener('dragenter', this.handleTopDragEnter);
    window.addEventListener('dragenter', this.handleTopDragEnterCapture, true);
    window.addEventListener('dragleave', this.handleTopDragLeave);
    window.addEventListener('dragleave', this.handleTopDragLeaveCapture, true);
    window.addEventListener('dragover', this.handleTopDragOver);
    window.addEventListener('dragover', this.handleTopDragOverCapture, true);
    window.addEventListener('drop', this.handleTopDrop);
    window.addEventListener('drop', this.handleTopDropCapture, true);
  };

  HTML5Backend.prototype.teardown = function teardown() {
    this.constructor.isSetUp = false;

    if (typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('dragstart', this.handleTopDragStart);
    window.removeEventListener('dragstart', this.handleTopDragStartCapture, true);
    window.removeEventListener('dragend', this.handleTopDragEnd);
    window.removeEventListener('dragend', this.handleTopDragEndCapture, true);
    window.removeEventListener('dragenter', this.handleTopDragEnter);
    window.removeEventListener('dragenter', this.handleTopDragEnterCapture, true);
    window.removeEventListener('dragleave', this.handleTopDragLeave);
    window.removeEventListener('dragleave', this.handleTopDragLeaveCapture, true);
    window.removeEventListener('dragover', this.handleTopDragOver);
    window.removeEventListener('dragover', this.handleTopDragOverCapture, true);
    window.removeEventListener('drop', this.handleTopDrop);
    window.removeEventListener('drop', this.handleTopDropCapture, true);

    this.clearCurrentDragSourceNode();
  };

  HTML5Backend.prototype.getDesiredDropEffect = function getDesiredDropEffect() {
    var sourceId = this.monitor.getSourceId();
    var sourceNodeOptions = this.sourceNodeOptions[sourceId];
    return sourceNodeOptions.effect || 'move';
  };

  HTML5Backend.prototype.isDraggingNativeItem = function isDraggingNativeItem() {
    switch (this.monitor.getItemType()) {
      case _NativeTypes2['default'].FILE:
      case _NativeTypes2['default'].URL:
        return true;
      default:
        return false;
    }
  };

  HTML5Backend.prototype.beginDragNativeUrl = function beginDragNativeUrl() {
    this.clearCurrentDragSourceNode();

    this.currentNativeSource = new UrlDragSource();
    this.currentNativeHandle = this.registry.addSource(_NativeTypes2['default'].URL, this.currentNativeSource);
    this.actions.beginDrag(this.currentNativeHandle);
  };

  HTML5Backend.prototype.beginDragNativeFile = function beginDragNativeFile() {
    this.clearCurrentDragSourceNode();

    this.currentNativeSource = new FileDragSource();
    this.currentNativeHandle = this.registry.addSource(_NativeTypes2['default'].FILE, this.currentNativeSource);
    this.actions.beginDrag(this.currentNativeHandle);
  };

  HTML5Backend.prototype.endDragNativeItem = function endDragNativeItem() {
    this.actions.endDrag();
    this.registry.removeSource(this.currentNativeHandle);
    this.currentNativeHandle = null;
    this.currentNativeSource = null;
  };

  HTML5Backend.prototype.endDragIfSourceWasRemovedFromDOM = function endDragIfSourceWasRemovedFromDOM() {
    var node = this.currentDragSourceNode;
    if (document.body.contains(node)) {
      return;
    }

    this.actions.endDrag();
    this.clearCurrentDragSourceNode();
  };

  HTML5Backend.prototype.setCurrentDragSourceNode = function setCurrentDragSourceNode(node) {
    this.clearCurrentDragSourceNode();
    this.currentDragSourceNode = node;
    this.currentDragSourceNodeRect = getElementRect(node);
    this.currentDragSourceNodeRectChanged = false;

    // Receiving a mouse event in the middle of a dragging operation
    // means it has ended and the drag source node disappeared from DOM,
    // so the browser didn't dispatch the dragend event.
    window.addEventListener('mousemove', this.endDragIfSourceWasRemovedFromDOM, true);
  };

  HTML5Backend.prototype.clearCurrentDragSourceNode = function clearCurrentDragSourceNode() {
    if (this.currentDragSourceNode) {
      this.currentDragSourceNode = null;
      this.currentDragSourceNodeRect = null;
      this.currentDragSourceNodeRectChanged = false;
      window.removeEventListener('mousemove', this.endDragIfSourceWasRemovedFromDOM, true);
      return true;
    } else {
      return false;
    }
  };

  HTML5Backend.prototype.checkIfCurrentDragSourceRectChanged = function checkIfCurrentDragSourceRectChanged() {
    var node = this.currentDragSourceNode;
    if (!node) {
      return false;
    }

    if (this.currentDragSourceNodeRectChanged) {
      return true;
    }

    this.currentDragSourceNodeRectChanged = !_shallowEqual2['default'](getElementRect(node), this.currentDragSourceNodeRect);

    return this.currentDragSourceNodeRectChanged;
  };

  HTML5Backend.prototype.handleTopDragStartCapture = function handleTopDragStartCapture() {
    this.clearCurrentDragSourceNode();
    this.dragStartSourceHandles = [];
  };

  HTML5Backend.prototype.handleDragStart = function handleDragStart(e, sourceId) {
    this.dragStartSourceHandles.push([sourceId, e.currentTarget]);
  };

  HTML5Backend.prototype.handleTopDragStart = function handleTopDragStart(e) {
    var _this = this;

    var dragStartSourceHandles = this.dragStartSourceHandles;

    this.dragStartSourceHandles = null;

    // Try calling beginDrag() on each drag source
    // until one of them agrees to to be dragged.
    var sourceId = null;
    var sourceNode = null;
    for (var i = 0; i < dragStartSourceHandles.length; i++) {
      var _dragStartSourceHandles$i = _slicedToArray(dragStartSourceHandles[i], 2);

      sourceId = _dragStartSourceHandles$i[0];
      sourceNode = _dragStartSourceHandles$i[1];

      // Pass false to keep drag source unpublished.
      // We will publish it in the next tick so browser
      // has time to screenshot current state and doesn't
      // cancel drag if the source DOM node is removed.
      this.actions.beginDrag(sourceId, false);

      if (this.monitor.isDragging()) {
        break;
      }
    }

    var dataTransfer = e.dataTransfer;

    if (this.monitor.isDragging()) {
      // Use custom drag image if user specifies it.
      // If child drag source refuses drag but parent agrees,
      // use parent's node as drag image. Neither works in IE though.
      var dragPreview = this.sourcePreviewNodes[sourceId] || sourceNode;

      var _getMouseEventOffsets = getMouseEventOffsets(e, sourceNode, dragPreview);

      var offsetFromDragPreview = _getMouseEventOffsets.offsetFromDragPreview;

      var dragPreviewOffset = getDragPreviewOffset(sourceNode, dragPreview, offsetFromDragPreview);
      dataTransfer.setDragImage(dragPreview, dragPreviewOffset.x, dragPreviewOffset.y);

      try {
        // Firefox won't drag without setting data
        dataTransfer.setData('application/json', {});
      } catch (err) {}

      // Store drag source node so we can check whether
      // it is removed from DOM and trigger endDrag manually.
      this.setCurrentDragSourceNode(e.target);

      setTimeout(function () {
        // By now, the browser has taken drag screenshot
        // and we can safely let the drag source know it's active.
        _this.actions.publishDragSource();
      });
    } else if (isUrlDataTransfer(dataTransfer)) {
      // URL dragged from inside the document
      this.beginDragNativeUrl();
    } else {
      // If by this time no drag source reacted, tell browser not to drag.
      e.preventDefault();
    }
  };

  HTML5Backend.prototype.handleTopDragEndCapture = function handleTopDragEndCapture() {
    if (this.clearCurrentDragSourceNode()) {
      // Firefox can dispatch this event in an infinite loop
      // if dragend handler does something like showing an alert.
      // Only proceed if we have not handled it already.
      this.actions.endDrag();
    }
  };

  HTML5Backend.prototype.handleTopDragEnd = function handleTopDragEnd() {};

  HTML5Backend.prototype.handleTopDragOverCapture = function handleTopDragOverCapture() {
    this.dragOverTargetHandles = [];
  };

  HTML5Backend.prototype.handleDragOver = function handleDragOver(e, targetId) {
    this.dragOverTargetHandles.unshift(targetId);
  };

  HTML5Backend.prototype.handleTopDragOver = function handleTopDragOver(e) {
    var _this2 = this;

    var dragOverTargetHandles = this.dragOverTargetHandles;

    this.dragOverTargetHandles = [];
    this.actions.hover(dragOverTargetHandles);

    var canDrop = dragOverTargetHandles.some(function (targetId) {
      return _this2.monitor.canDrop(targetId);
    });

    if (canDrop) {
      // Show user-specified drop effect.
      e.preventDefault();
      e.dataTransfer.dropEffect = this.getDesiredDropEffect();
    } else if (this.isDraggingNativeItem()) {
      // Don't show a nice cursor but still prevent default
      // "drop and blow away the whole document" action.
      e.preventDefault();
      e.dataTransfer.dropEffect = 'none';
    } else if (this.checkIfCurrentDragSourceRectChanged()) {
      // Prevent animating to incorrect position.
      // Drop effect must be other than 'none' to prevent animation.
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  HTML5Backend.prototype.handleTopDragEnterCapture = function handleTopDragEnterCapture(e) {
    this.dragEnterTargetHandles = [];

    var isFirstEnter = this.enterLeaveCounter.enter(e.target);
    if (!isFirstEnter || this.monitor.isDragging()) {
      return;
    }

    var dataTransfer = e.dataTransfer;

    if (isFileDataTransfer(dataTransfer)) {
      // File dragged from outside the document
      this.beginDragNativeFile();
    } else if (isUrlDataTransfer(dataTransfer)) {
      // URL dragged from outside the document
      this.beginDragNativeUrl();
    }
  };

  HTML5Backend.prototype.handleDragEnter = function handleDragEnter(e, targetId) {
    this.dragEnterTargetHandles.unshift(targetId);
  };

  HTML5Backend.prototype.handleTopDragEnter = function handleTopDragEnter(e) {
    var _this3 = this;

    var dragEnterTargetHandles = this.dragEnterTargetHandles;

    this.dragEnterTargetHandles = [];
    this.actions.hover(dragEnterTargetHandles);

    var canDrop = dragEnterTargetHandles.some(function (targetId) {
      return _this3.monitor.canDrop(targetId);
    });

    if (canDrop) {
      // IE requires this to fire dragover events
      e.preventDefault();
      e.dataTransfer.dropEffect = this.getDesiredDropEffect();
    }
  };

  HTML5Backend.prototype.handleTopDragLeaveCapture = function handleTopDragLeaveCapture(e) {
    if (this.isDraggingNativeItem()) {
      e.preventDefault();
    }

    var isLastLeave = this.enterLeaveCounter.leave(e.target);
    if (!isLastLeave || !this.isDraggingNativeItem()) {
      return;
    }

    this.endDragNativeItem();
  };

  HTML5Backend.prototype.handleTopDragLeave = function handleTopDragLeave() {};

  HTML5Backend.prototype.handleTopDropCapture = function handleTopDropCapture(e) {
    this.dropTargetHandles = [];

    if (this.isDraggingNativeItem()) {
      e.preventDefault();
      this.currentNativeSource.mutateItemByReadingDataTransfer(e.dataTransfer);
    }

    this.enterLeaveCounter.reset();
  };

  HTML5Backend.prototype.handleDrop = function handleDrop(e, targetId) {
    this.dropTargetHandles.unshift(targetId);
  };

  HTML5Backend.prototype.handleTopDrop = function handleTopDrop() {
    var dropTargetHandles = this.dropTargetHandles;

    this.dropTargetHandles = [];

    this.actions.hover(dropTargetHandles);
    this.actions.drop();

    if (this.isDraggingNativeItem()) {
      this.endDragNativeItem();
    } else {
      this.endDragIfSourceWasRemovedFromDOM();
    }
  };

  HTML5Backend.prototype.connect = function connect() {
    return {
      dragSource: this.connectSourceNode,
      dragSourcePreview: this.connectSourcePreviewNode,
      dropTarget: this.connectTargetNode
    };
  };

  HTML5Backend.prototype.connectSourcePreviewNode = function connectSourcePreviewNode(sourceId, node) {
    var _this4 = this;

    this.sourcePreviewNodes[sourceId] = node;

    return function () {
      delete _this4.sourcePreviewNodes[sourceId];
    };
  };

  HTML5Backend.prototype.connectSourceNode = function connectSourceNode(sourceId, node) {
    var _this5 = this;

    var options = arguments[2] === undefined ? {} : arguments[2];

    var handleDragStart = function handleDragStart(e) {
      return _this5.handleDragStart(e, sourceId);
    };

    this.sourceNodeOptions[sourceId] = options;
    node.setAttribute('draggable', true);
    node.addEventListener('dragstart', handleDragStart);

    return function () {
      delete _this5.sourceNodeOptions[sourceId];
      node.removeEventListener('dragstart', handleDragStart);
      node.setAttribute('draggable', false);
    };
  };

  HTML5Backend.prototype.connectTargetNode = function connectTargetNode(targetId, node) {
    var _this6 = this;

    var handleDragEnter = function handleDragEnter(e) {
      return _this6.handleDragEnter(e, targetId);
    };
    var handleDragOver = function handleDragOver(e) {
      return _this6.handleDragOver(e, targetId);
    };
    var handleDrop = function handleDrop(e) {
      return _this6.handleDrop(e, targetId);
    };

    node.addEventListener('dragenter', handleDragEnter);
    node.addEventListener('dragover', handleDragOver);
    node.addEventListener('drop', handleDrop);

    return function () {
      node.removeEventListener('dragenter', handleDragEnter);
      node.removeEventListener('dragover', handleDragOver);
      node.removeEventListener('drop', handleDrop);
    };
  };

  return HTML5Backend;
})();

exports['default'] = HTML5Backend;
module.exports = exports['default'];

// IE doesn't support MIME types in setData