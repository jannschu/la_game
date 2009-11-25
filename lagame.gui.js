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
 * @param {Number} x Horizontal position from top left
 * @param {Number} y Vertical position from top left
 * @param {Boolean} choosing true if it should print the L-Piece in the 'user 
 * chooses a positon' mode (maybe transparent)
 */
LaGameGUI.prototype.setNeutral = function(x, y, choosing) {
  var canX = (this.border + this.fieldSize) * x + this.fieldSize / 2 + this.border;
  var canY = (this.border + this.fieldSize) * y + this.fieldSize / 2 + this.border;
  var ctx = this.canvas.getContext('2d');
  ctx.beginPath();
  ctx.fillStyle = choosing ? 'rgba(0, 0, 0, 0.6)' : 'black';
  ctx.arc(canX, canY, this.fieldSize / 2, 0, Math.PI * 2, true);
  ctx.fill();
};

/**
 * @see #setNeutral
 * @param {Number} rotation Can be 0, 1, 2, 3
 * Starting by 0 and then rotated anti-clockwise:
 * 0: #    1:  #  2: ###  3: ##
 *    ###      #       #     #
 *            ##             #
 * @param {Boolean} inversed true if the above should be flipped horizontal
 */
LaGameGUI.prototype.setLPiece = function(x, y, rotation, inversed, player, choosing) {
  var fields = realisePiece({x:x, y:y, rot:rotation, inv:inversed, type:"l"});
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