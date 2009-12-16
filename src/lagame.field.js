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

/* ************************************************************************ *
 *  YOU     ARE     ENTERING     THE     REALM     OF     CHAOS             *
 *                                                                          *
 *                           BE PREPARED...                                 *
 * ************************************************************************ */

function LaGameField() {
  this.lPieces = [
    new LPiece(new V2d(0,2), 0, false, 0),
    new LPiece(new V2d(3,1), 2, false, 1)
  ]
  
  this.nPieces = [
    new NPiece(new V2d(0,0), 0),
    new NPiece(new V2d(3,3), 1)
  ]
  
  this.cachedOcc = []

}

LaGameField.prototype.copy = function() {
  var copy = new LaGameField();
  copy.lPieces = this.lPieces.copy();
  copy.nPieces = this.nPieces.copy();
  copy.cachedOcc = this.cachedOcc.copy();
  return copy;
};

LaGameField.prototype.hashCode = function(playerPerspective) {
  if (playerPerspective === undefined) playerPerspective = 0;
  // first make player one's l-piece have a vertical long tail
  var hashField = this.copy();
  var refLPiece = hashField.lPieces[playerPerspective];
  if (refLPiece.rot == 0 || refLPiece.rot == 2) hashField.rotateField();
  // now make the long tail show downwards
  if (refLPiece.rot == 1) hashField.inverseFieldVertically();
  // now make shure it is not horizontally inversed
  if (refLPiece.inv) hashField.inverseFieldHorizontally();
  
  var lPieceHash = function(piece) {
    return "" + piece.rot + piece.pos.x + piece.pos.y + (piece.inv ? 1 : 0);
  };
  var nPieceHash = function(a, b) {
    var a = "" + a.pos.x + a.pos.y;
    var b = "" + b.pos.x + b.pos.y;
    if (Number(a) < Number(b)) return a + b;
    else return b + a;
  };
  var code = lPieceHash(hashField.lPieces[playerPerspective]) + 
    lPieceHash(hashField.lPieces[makeOpposite(playerPerspective)]) +
    nPieceHash(hashField.nPieces[0], hashField.nPieces[1]);
  return parseInt(code, 4);
};

LaGameField.prototype.inverseFieldHorizontally = function() {
  var n = this.nPieces;
  n[0].pos.x = 3 - n[0].pos.x;
  n[1].pos.x = 3 - n[1].pos.x;
  var l = this.lPieces;
  l[0].pos.x = 3 - l[0].pos.x;
  l[1].pos.x = 3 - l[1].pos.x;
  l[0].inv = !l[0].inv;
  l[1].inv = !l[1].inv;
};

LaGameField.prototype.inverseFieldVertically = function() {
  var n = this.nPieces;
  n[0].pos.y = 3 - n[0].pos.y;
  n[1].pos.y = 3 - n[1].pos.y;
  var l = this.lPieces;
  l[0].pos.y = 3 - l[0].pos.y;
  l[1].pos.y = 3 - l[1].pos.y;
  if ((l[0].rot += 2) >= 4) l[0].rot -= 4
  if ((l[1].rot += 2) >= 4) l[1].rot -= 4
  l[0].inv = !l[0].inv;
  l[1].inv = !l[1].inv;
};

LaGameField.prototype.rotateField = function() {
  var rotateNPiece = function(n) {
    var x0 = n.pos.x;
    n.pos.x = n.pos.y;
    n.pos.y = 3 - x0;
    return n;
  };
  var rotateLPiece = function(l) {
    var x0 = l.pos.x;
    l.pos.x = l.pos.y;
    l.pos.y = 3 - x0;
    l.rot = Math.abs(l.inv ? l.rot + 3 : l.rot + 1) % 4;
    return l;
  };
  rotateNPiece(this.nPieces[0]);
  rotateNPiece(this.nPieces[1]);
  rotateLPiece(this.lPieces[0]);
  rotateLPiece(this.lPieces[1]);
};

/**
 * Returns two dimensional array with 0 for empty field and 1 for non-empty
 * @param {PieceArray} pieces The pieces to include in estimating stuff
 */
LaGameField.prototype.getOccupiedField = function(pieces) {
  var field = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  
  var realisedFields = []  
  for (var i = 0; i < pieces.length; ++i)
    realisedFields = realisedFields.concat(pieces[i].realise())
  
  for (var i = 0; i < realisedFields.length; ++i)
    field[realisedFields[i].y][realisedFields[i].x] = 1
  
  // var outp = ""
  // for(var d = 0; d < field.length; ++d) outp += field[d].join("") + "\n";
  // console.log(outp)
  return field
}

LaGameField.prototype.getEmptyNs = function() {
  var candidates = [ this.lPieces[0], this.lPieces[1], this.nPieces[0], this.nPieces[1]]
  
  var field = this.getOccupiedField(candidates)
  var emptyNs = [];
  var incr = new V2d(1,0);
  var end = new V2d(3, 3);
  for(var pos = new V2d(0, 0); !pos.isEqual(end); pos.addInBox(incr)) {
    if (field[pos.y][pos.x] == 0)
      emptyNs.push(pos.copy());
  }
  return emptyNs;
}

LaGameField.prototype.getEmptyLs = function(excludeLid, stopAfter) {
  var pieces = [this.lPieces[makeOpposite(excludeLid)]].concat(this.nPieces);
  var field = this.getOccupiedField(pieces);
  var excludePiece = this.lPieces[excludeLid];
  var player = excludePiece.player;
  var emptyLs = [];
  var rotated = false;
  
  var rotateField = function() {
    var newField = [[], [], [], []];
    for (var x = 0; x < 4; ++x) {
      for (var y = 0; y < 4; ++y) {
        newField[x][y] = field[y][x];
      }
    }
    rotated = !rotated;
    field = newField;
  };
  
  var generateLPieceFrom = function(pos, shortPos) {
    var lPiece = new LPiece(pos, 0, false, player);
    if (rotated) {
      lPiece.rot = shortPos.y < 2 ? 3 : 1;
      lPiece.inv = ((lPiece.rot == 3 && shortPos.x < pos.x) || 
        (lPiece.rot == 1 && shortPos.x > pos.x));
    } else {
      pos.swapPoints();
      shortPos.swapPoints();
      lPiece.rot = shortPos.y > pos.y ? 2 : 0;
      lPiece.inv = ((lPiece.rot == 0 && pos.x > 1) ||
        (lPiece.rot == 2 && pos.x < 2));
    }
    if (!lPiece.isSame(excludePiece)) emptyLs.push(lPiece);
  };
  
  var addLPiecesFor = function(rowNr, row, conditions) {
    var cond, startL, shortTail;
    for (var i = 0; i < conditions.length; ++i) { cond = conditions[i];
      if (cond instanceof Array) { // longTail to check
        startL = cond[0]; shortTail = cond[1];
        if (!row[startL] && !row[startL + 1] && !row[startL + 2])
          generateLPieceFrom(new V2d(rowNr, shortTail), new V2d(rowNr - 1, shortTail));
      } else { // shortTail to check
        if (!row[cond])
          generateLPieceFrom(new V2d(rowNr - 1, cond), new V2d(rowNr, cond));
      }
    }
  }
  
  var findVerticalLPieces = function() {
    var lRowCondition = [null, [], [], []];
    var row, ni;
    for (var i = 0; i < 4; ++i) { row = field[i]; ni = i + 1;
      if (i > 0) addLPiecesFor(i, row, lRowCondition[i]);
      if (i == 3) break;
      if (!row[0]) lRowCondition[ni].push([0, 0]);
      if (!row[1]) lRowCondition[ni].push([1, 1]);
      if (!row[2]) lRowCondition[ni].push([0, 2]);
      if (!row[3]) lRowCondition[ni].push([1, 3]);
      if (!row[1] && !row[2]) {
        if (!row[0]) lRowCondition[ni] = lRowCondition[ni].concat([0, 2]);
        if (!row[3]) lRowCondition[ni] = lRowCondition[ni].concat([1, 3]);
      }
    }
  };
  findVerticalLPieces();
  rotateField();
  findVerticalLPieces();
  return emptyLs;
}
