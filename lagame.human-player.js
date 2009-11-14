function LaGamePlayer(playerNumber, gui, logic) {
  this.playerNumber = playerNumber; // public
  this.gui = gui; // public
  this.logic = logic; // public
  
  this.doingMove = false; // public
  this.endMoveCallback = null;
  
  this.canMoveL = false; // public
  this.canMoveNeutral = false; // public
};

LaGamePlayer.prototype.startMoving = function(l, neutral, callback) {
  this.canMoveL = !!l;
  this.canMoveNeutral = !!neutral;
  this.endMoveCallback = callback;
  
  this.doingMove = true;
  
  this.registerEvents();
};

/*****************************************************************************/
/*                                PRIVATE                                    */
/*****************************************************************************/

LaGamePlayer.prototype.registerEvents = function() {
  this.gui.canvas.currentPlayer = this;
  this.gui.canvas.addEventListener('mousemove', LaGamePlayer.canvasPointer, false);
};

LaGamePlayer.prototype.unregisterEvents = function() {
  this.gui.canvas.removeEventListener('mousemove', LaGamePlayer.canvasPointer, false);
};

LaGamePlayer.canvasPointer = function(c) {
  if (!this.currentPlayer.doingMove) {
    this.currentPlayer.unregisterEvents();
    return;
  }
  var x = c.offsetX;
  var y = c.offsetY;
  
  if (this.currentPlayer.coordOverOwnGamePiece(x, y)) {
    this.style.cursor = 'pointer';
  } else {
    this.style.cursor = 'default';
  }
};

LaGamePlayer.prototype.coordOverOwnGamePiece = function(x, y) {
  var pieces = [];
  if (this.canMoveNeutral) pieces = pieces.concat(this.logic.getNPieces());
  if (this.canMoveL) pieces.push(this.logic.getLPieces()[this.playerNumber]);
  
  var fieldSum = this.gui.fieldSize + this.gui.border;
  
  var piece, fields, field;
  var fieldX, fieldY, j;
  for (var i = 0; i < pieces.length; ++i) {
    piece = pieces[i];
    fields = realisePiece(piece);
    for (j = 0; j < fields.length; ++j) {
      field = fields[j];
      fieldX = field.x * fieldSum;
      fieldY = field.y * fieldSum;
      if (x >= fieldX && x < fieldX + fieldSum && 
          y >= fieldY && y < fieldY + fieldSum) return piece;
    }
  }
  return false;
};