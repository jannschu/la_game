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

function NPiece(pos, nid) {
  this.pos = pos
  this.nid = nid
}

NPiece.prototype.copy = function() {
  return new NPiece(this.pos.copy(), this.nid)
};

NPiece.prototype.realise = function() {
  return [ this.pos.copy() ]
}

/* TODO: discuss: nid? */
NPiece.prototype.isSame = function(rhs) {
  return this.pos.isEqual(rhs.pos);
}
