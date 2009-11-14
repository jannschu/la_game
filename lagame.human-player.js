function LaGamePlayer(playerNumber, gui, logic) {
  this.playerNumber = playerNumber; // public
  this.gui = gui; // public
  this.logic = logic; // public
  
  this.doingMove = false; // public
  this.movingPiece = null; // public
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
  document.currentPlayer = this;
  
  this.gui.canvas.addEventListener('mousemove', LaGamePlayer.canvasPointer, false);
  this.gui.canvas.addEventListener('click', LaGamePlayer.choosePiece, false);
  document.addEventListener('keydown', LaGamePlayer.gameKeyEvent, false);
};

LaGamePlayer.prototype.unregisterEvents = function() {
  this.gui.canvas.removeEventListener('mousemove', LaGamePlayer.canvasPointer, false);
  this.gui.canvas.removeEventListener('click', LaGamePlayer.choosePiece, false);
  document.removeEventListener('keydown', LaGamePlayer.gameKeyEvent, false);
};

LaGamePlayer.choosePiece = function(e) {
  if (!this.currentPlayer.doingMove) {
    this.currentPlayer.unregisterEvents();
    return;
  }
   if (this.currentPlayer.movingPiece) return;
   var piece = this.currentPlayer.coordOverOwnGamePiece(e.offsetX, e.offsetY);
   if (piece) {
     this.currentPlayer.movingPiece = piece;
     this.currentPlayer.gui.canvas.style.cursor = 'default';
     this.currentPlayer.drawGameBoard();
   }
};

LaGamePlayer.gameKeyEvent = function(e) {
  if (!this.currentPlayer.doingMove || !this.currentPlayer.movingPiece) {
    this.currentPlayer.unregisterEvents();
    return;
  }
  var mp = this.currentPlayer.movingPiece;
  switch (e.keyIdentifier) {
    case 'Enter': 
      
      break;
    case 'U+0020':
      LaGamePlayer.rotateLPiece(mp);
      break; // space bar
    case 'U+0042':
      if (mp.type == 'l') mp.inv = !mp.inv;
      break; // B
    case 'Right': mp.x += 1; break;
    case 'Left': mp.x -= 1; break;
    case 'Up': mp.y -= 1; break;
    case 'Down': mp.y += 1; break;
  }
  var mods = LaGamePlayer.moveOutOfBoxPiece(mp);
  mp.x += mods.x;
  mp.y += mods.y;
  this.currentPlayer.drawGameBoard();
};

LaGamePlayer.rotateLPiece = function(piece) {
  var inv = !!piece.inv;
  switch (piece.rot) {
    case 0:
      piece.rot = 1;
      console.log(piece)
      piece.x += inv ? -1 : 2;
      break;
    case 1:
      piece.rot = 2;
      if (inv) {
        piece.x -= 1;
        piece.y -= 1;
      } else piece.y -= 1;
      break;
    case 2:
      piece.rot = 3;
      if (inv) {
        piece.x += 2;
        piece.y -= 1;
      } else {
        piece.x -= 1;
        piece.y -= 1;
      }
      break;
    case 3:
      piece.rot = 0;
      piece.y += 2;
      if (!inv) piece.x -= 1;
      break;
  }
};

LaGamePlayer.canvasPointer = function(c) {
  if (!this.currentPlayer.doingMove) {
    this.currentPlayer.unregisterEvents();
    return;
  }
  if (this.currentPlayer.movingPiece) {
    removeEventListener('mousemove', LaGamePlayer.canvasPointer, false);
    this.removeEventListener('mousemove', LaGamePlayer.canvasPointer, false);
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

LaGamePlayer.moveOutOfBoxPiece = function(piece) {
  var fields = realisePiece(piece);
  var f, modX, modY;
  for (var i = 0; i < fields.length; ++i) {
    f = fields[i];
    if (f.x < 0 && (modX == undefined || f.x < modX))
      modX = -f.x
    else if (f.x > 3 && (modX == undefined || f.x > modX))
      modX = 3 - f.x;
    if (f.y < 0 && (modY == undefined || f.y < modY))
      modY = -f.y;
    else if (f.y > 3 && (modY == undefined || f.y > modY))
      modY = 3 - f.y;
  }
  return {x:modX ? modX : 0, y:modY ? modY : 0};
};

LaGamePlayer.prototype.drawGameBoard = function() {
  this.gui.drawGameBoard();
  var fields = [];
  if (this.movingPiece) {
    if (this.movingPiece.type == 'n') {
      var i = this.movingPiece.nid == 1 ? 0 : 1;
      fields.push(this.logic.getNPieces()[i]);
      fields = fields.concat(this.logic.getLPieces());
    } else {
      fields = fields.concat(this.logic.getNPieces());
      var player = this.playerNumber == 1 ? 0 : 1;
      fields.push(this.logic.getLPieces()[player]);
    }
  } else {
    fields = this.logic.getNPieces().concat(this.logic.getLPieces());
  }
  var field;
  for (var p = 0; p < fields.length; ++p) {
    field = fields[p];
    if (field.type == 'n')
      this.gui.setNeutral(field.x, field.y);
    else
      this.gui.setLPiece(field.x, field.y, field.rot, field.inv, field.player);
  }
  var mp = this.movingPiece;
  if (mp) {
    if (mp.type == 'n') {
      this.gui.setNeutral(mp.x, mp.y, true);
    } else {
      this.gui.setLPiece(mp.x, mp.y, mp.rot, mp.inv, mp.player, true);
    }
  }
};