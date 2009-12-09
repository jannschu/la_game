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

/**
 * Object representing the gui
 * All drawing is done here
 * @param {HTMLCanvasElement} canvas
 * @constructor
 */
function LaGameGUI(canvas, playerLabel, nextPlayerButton) {
  this.canvas = canvas;
  this.playerLabel = playerLabel;
  this.currentPlayer = null;
  this.nextPlayerButton = nextPlayerButton;
  this.border = 4;
  
  if (canvas.width != canvas.height) alert('Canvas should be quadratic');
  
  this.boardSize = canvas.width; // public
  this.fieldSize = (this.boardSize - 5 * this.border) / 4; // public

  this.lColor = ['red', 'blue', 'white'];
};

LaGameGUI.prototype.setPlayerLabel = function(text, player) {
  this.playerLabel.innerHTML = text;
  this.playerLabel.style.color = this.lColor[player];
  this.currentPlayer = player;
};

LaGameGUI.prototype.getCurrentPlayerForLabel = function() {
  return this.currentPlayer;
};

LaGameGUI.prototype.setCanFinishTurn = function(bool) {
  this.nextPlayerButton.disabled = !bool;
};

LaGameGUI.prototype.coordToPoint = function(cX, cY) {
  var dim = this.border + this.fieldSize;
  var x = Math.floor(cX / dim);
  var y = Math.floor(cY / dim);
  if (x == 4) x = 3;
  if (y == 4) y = 3;
  return {x:x, y:y};
};

/*****************************************************************************/
/*                                DRAWING                                    */
/*****************************************************************************/

/**
 * Places a neutral game piece
 * @param {NPiece} npiece the NPiece to draw
 * @param {Boolean} choosing true if it should print the L-Piece in the 'user 
 * chooses a positon' mode (maybe transparent)
 */
LaGameGUI.prototype.setNPiece = function(npiece, choosing) {
  var x = npiece.pos.x;
  var y = npiece.pos.y;
  var canX = (this.border + this.fieldSize) * x + this.fieldSize / 2 + this.border;
  var canY = (this.border + this.fieldSize) * y + this.fieldSize / 2 + this.border;
  var ctx = this.canvas.getContext('2d');
  ctx.beginPath();
  ctx.fillStyle = choosing ? 'rgba(0, 0, 0, 0.6)' : 'black';
  ctx.arc(canX, canY, this.fieldSize / 2, 0, Math.PI * 2, true);
  ctx.fill();
};

/**
 * @param {NPiece} npiece
 */
LaGameGUI.prototype.unsetNPiece = function(npiece) {
  var canX = (this.border + this.fieldSize) * npiece.pos.x + this.border;
  var canY = (this.border + this.fieldSize) * npiece.pos.y + this.border;
  var ctx = this.canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(canX, canY, this.fieldSize, this.fieldSize);
};

/**
 * @param {LPiece} lpiece
 * The rot property of lpiece starting by 0 and then rotated anti-clockwise:
 * 0: #    1:  #  2: ###  3: ##
 *    ###      #       #     #
 *            ##             #
 * @param {Boolean} choosing true if the piece is selected by the user
 */
LaGameGUI.prototype.setLPiece = function(lpiece, choosing) {
  var fields = lpiece.realise();
  var player = lpiece.player;
  
  this.setLFields(fields, player, choosing);
};

LaGameGUI.prototype.setLFields = function(fields, player, choosing) {
  var ctx = this.canvas.getContext('2d');
  if (choosing) ctx.globalAlpha = 0.5;
  var borderColor = player == 2 ? 'black' : this.lColor[player];
  var canX, canY;
  for(var i = 0; i < fields.length; ++i) {
    canX = (this.border + this.fieldSize) * fields[i].x + this.border;
    canY = (this.border + this.fieldSize) * fields[i].y + this.border;
    ctx.fillStyle = this.lColor[player];
    ctx.fillRect(canX, canY, this.fieldSize, this.fieldSize);
    ctx.fillStyle = borderColor;
    if (this.existsField(fields[i], fields, 'left')) 
      this.drawFillBorder(ctx, canX, canY, 'left');
    if (this.existsField(fields[i], fields, 'top')) 
      this.drawFillBorder(ctx, canX, canY, 'top');
  }
  ctx.globalAlpha = 1;
};

/**
 * @param {LPiece} lpiece
 */
LaGameGUI.prototype.unsetLPiece = function(lpiece) {
  var copy = lpiece.copy()
  copy.player = 2;
  this.setLPiece(copy);
};

/**
 * Places a collision signifier at a given position.
 * @param {Number} x The x coord
 * @param {Number} y The y coord
 */
LaGameGUI.prototype.setCollision = function(x, y, color) {
  var canX = (this.border + this.fieldSize) * x;
  var canY = (this.border + this.fieldSize) * y;

  var ctx = this.canvas.getContext('2d');
  var f = this.fieldSize;
  var b = this.border;
  
  ctx.fillStyle = color ? color : 'grey';
  ctx.fillRect(canX, canY, f + b * 2, b);
  ctx.fillRect(canX, canY + b , b, f);
  ctx.fillRect(canX + b + f, canY + b, b, f);
  ctx.fillRect(canX, canY + b + f, f + b * 2, b);
}

/**
 * Animates a move action
 * @param (LaGameField) oldField the field before the move
 * @param (LaGameField) newField the field after the move
 * @param (Function) callback the function which will be called after animation
 */
LaGameGUI.prototype.animateMove = function(oldField, newField, callback) {
  var gui = this;
  var moveNPiece = function(oldN, newN) {
    gui.unsetNPiece(oldN);
    gui.setNPiece(oldN, true);
    setTimeout(function() {
      gui.unsetNPiece(oldN);
      gui.setNPiece(newN);
    }, 700);
    return 700;
  };
  var isNeighbour = function(a, b) {
    return (a.x == b.x && Math.abs(a.y - b.y) == 1) ||
           (a.y == b.y && Math.abs(a.x- b.x) == 1)
  };
  var sortFieldsAsIfDragged = function(fields) {
    var startField, neighbours;
    for (var i = 0; i < fields.length; ++i) {
      neighbours = 0;
      startField = fields[i];
      for (var p = 0; p < fields.length; ++p) {
        if (p == i) continue;
        if (neighbours > 1) break;
        if (isNeighbour(fields[p], startField)) ++ neighbours;
      }
      if (neighbours == 1) break;
    }
    var sortedFields = [startField];
    for (var j = 0; sortedFields.length < 4; j == fields.length - 1 ? j = 0 : ++j) {
      if (isNeighbour(fields[j], sortedFields[sortedFields.length - 1])) {
        sortedFields.push(fields[j]);
        fields = fields.slice(0, j).concat(fields.slice(j + 1));
      }
    }
    return sortedFields;
  };
  var moveLPiece = function(oldL, newL) {
    gui.unsetLPiece(oldL);
    gui.setLPiece(oldL, true);
    var fields = sortFieldsAsIfDragged(newL.realise());
    var player = newL.player;
    setTimeout(function() { gui.setLFields(fields.slice(0, 1), player)}, 300);
    setTimeout(function() { gui.setLFields(fields.slice(0, 2), player)}, 600);
    setTimeout(function() { gui.setLFields(fields.slice(0, 3), player)}, 900);
    setTimeout(function() { gui.setLFields(fields.slice(0, 4), player)}, 1200);
    setTimeout(function() {
      gui.unsetLPiece(oldL);
      gui.setLPiece(newL);
    }, 1500);
    return 1500;
  }
  var oldPieces = oldField.lPieces.concat(oldField.nPieces);
  var newPieces = newField.lPieces;
  if (newField.nPieces[0].isSame(oldField.nPieces[1])) {
    newPieces = newPieces.concat([newField.nPieces[1], newField.nPieces[0]]);
  } else {
    newPieces = newPieces.concat(newField.nPieces);
  }
  var isSameLPiecePosition = function(a, b) {
    return a.pos.isEqual(b.pos) && a.rot == b.rot && a.inv == b.inv;
  };
  var animatePieces = function() {
    if (oldPieces.length == 0) {
      if (callback) setTimeout(callback, 0);
      return;
    }
    var oldPiece = oldPieces[0];
    var newPiece = newPieces[0];
    oldPieces = oldPieces.slice(1);
    newPieces = newPieces.slice(1);
    var timeout = 0;
    if (oldPiece instanceof NPiece && newPiece instanceof NPiece) {
      if (!oldPiece.isSame(newPiece)) timeout = moveNPiece(oldPiece, newPiece);
    } else if (oldPiece instanceof LPiece && newPiece instanceof LPiece) {
      if (!isSameLPiecePosition(oldPiece, newPiece))
        timeout = moveLPiece(oldPiece, newPiece);
    }
    setTimeout(animatePieces, timeout + 50);
  }
  animatePieces();
};

/**
 * Draws the basic game board with its borders and lines
 */
LaGameGUI.prototype.drawGameBoard = function() {
  var ctx = this.canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, this.boardSize, this.boardSize);
  ctx.fillStyle = 'black';
  var pos;
  for (var i = 0; i < 5; ++i) {
    pos = (this.border + this.fieldSize) * i;
    ctx.fillRect(pos, 0, this.border, this.boardSize);
    ctx.fillRect(0, pos, this.boardSize, this.border);
  }
};

/*****************************************************************************/
/*                                PRIVATE                                    */
/*****************************************************************************/
LaGameGUI.prototype.existsField = function(field, fields, position) {
  var searchField = {};
  switch (position) {
    case 'left': searchField = {x: field.x - 1, y: field.y}; break;
    case 'top': searchField = {x: field.x, y: field.y - 1}; break;
  }
  for (var i = 0; i < fields.length; ++i) {
    if (searchField.x == fields[i].x && searchField.y == fields[i].y)
      return searchField;
  }
  return false;
}

LaGameGUI.prototype.drawFillBorder = function(ctx, x, y, pos) {
  var width, height;
  if (pos == 'left') {
    x -= this.border;
    width = this.border;
    height = this.fieldSize;
  } else {
    y -= this.border;
    width = this.fieldSize;
    height = this.border;
  }
  ctx.fillRect(x, y, width, height);
};
