/*
 * This file is part of La Game.
 * Copyright 2009 Shahriar Heidrich and Jannik Schürg
 * 
 * La Game is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * La Game is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with La Game.  If not, see <http://www.gnu.org/licenses/>. 
 */

function LaGamePlayer(playerNumber, gui, logic) {
  this.playerNumber = playerNumber; // public
  this.gui = gui; // public
  this.logic = logic; // public
  
  this.doingMove = false; // public
  this.movingPiece = null;
  this.dragging = false;
  this.draggedFields = []; // public
  this.endMoveCallback = null;
  
  this.canMoveL = false; // public
  this.canMoveNeutral = false; // public
  
  var player = this;
  this.eventFunctions = {
    canvasPointer: function(e) { player.canvasPointer(e) },
    stopDrag: function(e) { player.stopDragging(e) },
    startDrag: function(e) { player.startDragging(e) },
    drag: function(e) { 
      if (player.doingMove && player.movingPiece && player.dragging)
        player.drag(e)
    },
    exitChoose: function(e) {
      if (e.keyCode == 27) player.exitChoose()
    },
    mouseOut: function(e) {
      player.mouseMovedOut();
    },
    choose: function(e) { player.choosePiece(e) }
  }
  
};

LaGamePlayer.prototype.startMoving = function(l, neutral, callback) {
  if (this.gui.getCurrentPlayerForLabel() != this.playerNumber) 
    this.gui.setPlayerLabel("Spieler " + (this.playerNumber + 1) + " ist dran",
      this.playerNumber
    )
  
  this.canMoveL = !!l;
  this.canMoveNeutral = !!neutral;
  this.endMoveCallback = callback;
  
  this.doingMove = true;
  
  if (!this.canMoveL && this.canMoveNeutral) {
    this.gui.setCanFinishTurn(true);
  }
  
  this.registerChooseEvents();
};
// notRedraw: true will not draw it, false will draw it
LaGamePlayer.prototype.retryMove = function(notRedraw) {
  var mp = this.canMoveL && !this.canMoveNeutral ? this.movingPiece : null;
  this.stopMoving(!notRedraw);
  this.movingPiece = mp;
  this.doingMove = true;
  if (!notRedraw) this.drawGameBoard();
  this.registerChooseEvents();
};

LaGamePlayer.prototype.stopMoving = function(notRedraw) {
  this.unregisterEvents();
  this.doingMove = false;
  this.dragging = false;
  this.movingPiece = null;
  this.draggedFields = [];
  if (!notRedraw) this.drawGameBoard();
};

/*****************************************************************************/
/*                                PRIVATE                                    */
/*****************************************************************************/

LaGamePlayer.prototype.registerChooseEvents = function() {
  this.gui.canvas.addEventListener('mousemove', this.eventFunctions.canvasPointer, false);
  this.gui.canvas.addEventListener('click', this.eventFunctions.choose, false);
};

LaGamePlayer.prototype.unregisterEvents = function() {
  this.gui.canvas.removeEventListener('mousemove', this.eventFunctions.canvasPointer, false);
  this.gui.canvas.removeEventListener('click', this.eventFunctions.choose, false);
  
  this.gui.canvas.removeEventListener('mousemove', this.eventFunctions.drag, false);
  this.gui.canvas.removeEventListener('mouseup', this.eventFunctions.stopDrag, false);
  this.gui.canvas.removeEventListener('mousedown', this.eventFunctions.startDrag, false);
  document.removeEventListener('keydown', this.eventFunctions.exitChoose, false);
  this.gui.canvas.removeEventListener('mouseout', this.eventFunctions.mouseOut, false);
};

LaGamePlayer.prototype.arrangeDragEvents = function() {
  this.gui.canvas.removeEventListener('click', this.eventFunctions.choose, false);
  this.gui.canvas.removeEventListener('mousemove', this.eventFunctions.canvasPointer, false);
  
  this.gui.canvas.addEventListener('mouseup', this.eventFunctions.stopDrag, false);
  this.gui.canvas.addEventListener('mousedown', this.eventFunctions.startDrag, false);
  this.gui.canvas.addEventListener('mousemove', this.eventFunctions.drag, false);
  document.addEventListener('keydown', this.eventFunctions.exitChoose, false);
  this.gui.canvas.addEventListener('mouseout', this.eventFunctions.mouseOut, false);
}

/*****************************************************************************/
/*                                 EVENTS                                    */
/*****************************************************************************/

LaGamePlayer.prototype.choosePiece = function(e) {
  if (!this.doingMove) return;
  if (this.movingPiece) {
    this.arrangeDragEvents();
    return;
  }
  var pos = this.mousePosToCanvasPosition(e);
  var piece = this.coordOverOwnGamePiece(pos);
  if (piece) {
    this.movingPiece = piece.copy();
    this.gui.canvas.style.cursor = 'default';
    this.arrangeDragEvents();
    this.drawGameBoard();
  }
}

LaGamePlayer.prototype.canvasPointer = function(c) {
  if (!this.doingMove) return;
  if (this.movingPiece) {
    this.arrangeDragEvents();
    return;
  }
  
  var pos = this.mousePosToCanvasPosition(c);
  
  if (this.coordOverOwnGamePiece(pos)) {
    this.gui.canvas.style.cursor = 'pointer';
  } else {
    this.gui.canvas.style.cursor = 'default';
  }
};

LaGamePlayer.prototype.startDragging = function(e) {
  if (!this.doingMove || !this.movingPiece || this.movingPiece instanceof NPiece)
    return;
  this.dragging = true;
}

LaGamePlayer.prototype.drag = function(e) {
  if (this.movingPiece instanceof NPiece) return;
  if (this.draggedFields.length >= 4) return;
  var pos = this.mousePosToCanvasPosition(e);
  var include = false;
  var field;
  for (var i = 0; i < this.draggedFields.length; ++i) {
    field = this.draggedFields[i];
    if (field.x == pos.x && field.y == pos.y) {
      include = true;
      break;
    }
  }
  if (!include && this.isValidPosition(pos)) {
    this.draggedFields.push(pos);
    this.drawGameBoard();
  }
};

LaGamePlayer.prototype.stopDragging = function(e) {
  if (!this.doingMove || !this.movingPiece) return;
  
  if (this.movingPiece instanceof NPiece) {
    var pos = this.mousePosToCanvasPosition(e);
    this.movingPiece.pos.x = pos.x;
    this.movingPiece.pos.y = pos.y;
    this.callEndCallback(this.movingPiece);
  } else if (this.movingPiece instanceof LPiece) {
    var pos = this.mousePosToCanvasPosition(e);
    var mouseOverL = this.coordOverOwnGamePiece(pos, this.draggedFields);
    if (this.draggedFields.length == 4 && mouseOverL) {
      this.dragging = false;
      var condensedForm = this.getCondensedLPieceFor(this.draggedFields);
      this.callEndCallback(condensedForm);
      return;
    } else {
      this.retryMove();
    }
  }
}

LaGamePlayer.prototype.exitChoose = function() {
  if (this.dragging || !this.movingPiece) return;
  if (this.movingPiece instanceof NPiece) this.retryMove(false);
};

LaGamePlayer.prototype.mouseMovedOut = function() {
  if (!this.movingPiece) return;
  if (this.dragging) this.retryMove(false);
};

/*****************************************************************************/
/*                                HELPER                                     */
/*****************************************************************************/
/**
 * @param (V2d) test
 */
LaGamePlayer.prototype.fieldIsEmpty = function(test) {
  var pieces = [].concat(this.logic.getNPieces());
  pieces.push(this.logic.getLPieces()[makeOpposite(this.playerNumber)]);
  
  var j, fields;
  for (var i = 0; i < pieces.length; ++i) {
    fields = pieces[i].realise();
    for (j = 0; j < fields.length; ++j) {
      if (fields[j].x == test.x && fields[j].y == test.y) return false;
    }
  }
  return true;
};

/**
 * @param (V2d) pos
 */
LaGamePlayer.prototype.isValidPosition = function(pos) {
  if (!this.fieldIsEmpty(pos)) return false;
  var fields = this.draggedFields;
  var exists = function(test) {
    for (var i = 0; i < fields.length; ++i) {
      if (fields[i].x == test.x && fields[i].y == test.y) return true;
    }
    return false;
  }
  if (this.draggedFields.length == 0) return true;
  if (exists(new V2d(pos.x+1, pos.y)) ||
    exists(new V2d(pos.x-1, pos.y)) ||
    exists(new V2d(pos.x, pos.y+1)) ||
    exists(new V2d(pos.x, pos.y-1)) ) return this.canBeValidLPiece([pos].concat(fields));
  else return false;
};
/**
 * @param (V2d[]) fields
 */
LaGamePlayer.prototype.getCondensedLPieceFor = function(fields) {
  var a = fields[0];
  var b = fields[1];
  var c = fields[2];
  var d = fields[3];
  var isDiagonal = function(a, b) { // a, b instanceof V2d
    return Math.abs(a.x - b.x) == 1 && Math.abs(a.y - b.y) == 1;
  }
  var isPair = function(a, b) {
    return (a.x == b.x && Math.abs(a.y - b.y) == 1) ||
      (a.y == b.y && Math.abs(a.x - b.x) == 1)
  }
  var piece = new LPiece(new V2d(), null, null, this.playerNumber);
  var perms = [[a, b, c, d], [a, c, b, d], [a, d, b, c], [b, c, d, a], [b, d, a, c], [c, d, a, b]];
  var x, y, longTailEnd, shortTailEnd, nr, p;
  for (var i = 0; i < 6; ++i) {
    p = perms[i];
    if (isDiagonal(p[0], p[1])) {
      nr = (isPair(p[2], p[0]) && isPair(p[2], p[1])) ? 2 : 3
      x = p[nr].x
      y = p[nr].y
      longTailEnd = nr == 3 ? p[2] : p[3];
      shortTailEnd = (isPair(longTailEnd, p[0])) ? p[1] : p[0];
      break;
    }
  }
  if (x == undefined) return false;
  piece.pos.x = x;
  piece.pos.y = y;
  if (shortTailEnd.x == piece.pos.x) { // rot 0 or 2
    if (shortTailEnd.y < piece.pos.y) {
      piece.rot = 0;
      piece.inv = longTailEnd.x < piece.pos.x;
    } else {
      piece.rot = 2;
      piece.inv = longTailEnd.x > piece.pos.x;
    }
  } else { // rot 1 or 3
    if (longTailEnd.y < piece.pos.y) {
      piece.rot = 1;
      piece.inv = shortTailEnd.x > piece.pos.x;
    } else {
      piece.rot = 3;
      piece.inv = shortTailEnd.x < piece.pos.x;
    }
  }
  return piece;
};

/**
 * @param (V2d[]) fields
 */
LaGamePlayer.prototype.canBeValidLPiece = function(fields) {
  if (fields.length < 2) return true;
  if (fields.length > 4) return false;
  var isPair = function(a, b) {
    return (a.x == b.x && Math.abs(a.y - b.y) == 1) ||
      (a.y == b.y && Math.abs(a.x - b.x) == 1)
  }
  var isDiagonal = function(a, b) {
    return Math.abs(a.x - b.x) == 1 && Math.abs(a.y - b.y) == 1;
  }
  var isEdge = function(a, b, c) {
    var perms = [[a, b, c], [c, a, b], [b, c, a]];
    var p;
    for (var i = 0; i < 3; ++i) {
      p = perms[i];
      if (isDiagonal(p[0], p[1]) && isPair(p[0], p[2]) && isPair(p[2], p[1]))
        return true;
    }
    return false;
  }
  var isLine = function(a, b, c) {
    return (a.x == b.x && b.x == c.x && (a.y + b.y + c.y) % 3 == 0) || 
      (a.y == b.y && b.y == c.y && (a.x + b.x + c.x) % 3 == 0)
  };
  var isL = function(a, b, c, d) {
    var perms = [[a, b, c, d], [a, c, b, d], [a, d, b, c], [b, c, d, a], [b, d, a, c], [c, d, a, b]];
    var p;
    for (var i = 0; i < 6; ++i) {
      p = perms[i];
      if (isDiagonal(p[0], p[1])) {
        if ((isPair(p[0], p[2]) || isPair(p[1], p[2])) && 
          isPair(p[0], p[3]) && isPair(p[1], p[3])) return !isDiagonal(p[2], p[3]);
        else if ((isPair(p[0], p[3]) || isPair(p[1], p[3])) &&
          isPair(p[0], p[2]) && isPair(p[1], p[2])) return !isDiagonal(p[2], p[3]);
      }
    }
    return false;
  }
  var player = this;
  var notOldLPiece = function(fields) {
    var cond = player.getCondensedLPieceFor(fields);
    var old = player.logic.getLPieces()[player.playerNumber];
    return cond.pos.x != old.pos.x || cond.pos.y != old.pos.y || 
      cond.rot != old.rot || cond.inv != old.inv;
  }
  switch (fields.length) {
    case 2: return isPair(fields[0], fields[1]);
    case 3: return isLine(fields[0], fields[1], fields[2]) ||
      isEdge(fields[0], fields[1], fields[2]);
    case 4: return isL(fields[0], fields[1], fields[2], fields[3]) && notOldLPiece(fields);
  }
};

LaGamePlayer.prototype.callEndCallback = function(newPiece) {
  var callback = this.endMoveCallback;
  if (callback)
    window.setTimeout(function() { callback(newPiece) }, 0);
};

LaGamePlayer.prototype.mousePosToCanvasPosition = function(e) {
  var x = e.pageX - this.gui.canvas.offsetLeft;
  var y = e.pageY - this.gui.canvas.offsetTop;
  return this.gui.coordToPoint(x, y)
}

LaGamePlayer.prototype.getNonEmptyPieces = function() {
  var pieces = [];
  if (this.canMoveNeutral) pieces = pieces.concat(this.logic.getNPieces());
  if (this.canMoveL) pieces.push(this.logic.getLPieces()[this.playerNumber]);
  
  return pieces;
};

LaGamePlayer.prototype.coordOverOwnGamePiece = function(pos, replacingGameFields) {
  var checkFields = function(fields) { // fields V2d[]
    var field;
    for (j = 0; j < fields.length; ++j) {
      field = fields[j];
      if (pos.x == field.x && pos.y == field.y) return true;
    }
    return false;
  }
  if (!replacingGameFields) {
    var pieces = [];
    if (this.canMoveNeutral) pieces = pieces.concat(this.logic.getNPieces());
    if (this.canMoveL) pieces.push(this.logic.getLPieces()[this.playerNumber]);
    var piece, check;
    for (var i = 0; i < pieces.length; ++i) {
      piece = pieces[i];
      if (checkFields(piece.realise())) return piece;
    }
    return false;
  } else {
    return checkFields(replacingGameFields);
  }
};

LaGamePlayer.prototype.drawGameBoard = function() {
  this.gui.drawGameBoard();
  var mp = this.movingPiece;
  var pieces;
  if (mp) {
    if (mp instanceof NPiece) {
      pieces = [this.logic.getNPieces()[makeOpposite(mp.nid)]].
        concat(this.logic.getLPieces());
      this.gui.setNPiece(mp, true);
    } else {
      pieces = [this.logic.getLPieces()[makeOpposite(this.playerNumber)]].
        concat(this.logic.getNPieces());
      this.gui.setLPiece(mp, true);
    }
    
  } else {
    pieces = this.logic.getNPieces().concat(this.logic.getLPieces());
  }
  var piece;
  for (var p = 0; p < pieces.length; ++p) {
    piece = pieces[p];
    if (piece instanceof NPiece) {
      this.gui.setNPiece(piece);
    }
    else {
      this.gui.setLPiece(piece);
    }
  }
  if (this.draggedFields != []) {
    this.gui.setLFields(this.draggedFields, this.playerNumber);
  }
};
