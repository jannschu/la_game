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
  var player = this.currentPlayer.playerNumber;
  var lpieces = this.currentPlayer.logic.getLPieces();
  var npieces = this.currentPlayer.logic.getNPieces();
  var fields = [];
  if (this.currentPlayer.canMoveL) 
    fields = fields.concat(realisePiece(lpieces[player]));
  if (this.currentPlayer.canMoveNeutral) 
    fields = fields.concat(npieces);
  if (LaGamePlayer.coordOverOwnGamePiece(this.currentPlayer.gui, x, y, fields)) {
    this.style.cursor = 'pointer';
  } else {
    this.style.cursor = 'default';
  }
};

LaGamePlayer.coordOverOwnGamePiece = function(gui, x, y, pieces) {
  var field;
  var fieldX, fieldY;
  for (var i = 0; i < pieces.length; ++i) {
    field = pieces[i];
    fieldX = field.x * (gui.fieldSize + gui.border);
    fieldY = field.y * (gui.fieldSize + gui.border);
    if (x >= fieldX && x < fieldX + gui.fieldSize + gui.border && 
        y >= fieldY && y < fieldY + gui.fieldSize + gui.border) return true;
  }
  return false;
};