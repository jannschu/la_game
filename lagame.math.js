
function V2d(x, y) {

  this.x = x
  this.y = y

}

function V2d.prototype.copy = function() {

  return new V2d(this.x, this.y)

}

function V2d.prototype.add = function(rhs) {

  this.x += rhs.x
  this.y += rhs.y
  
  return this

}

function V2d.prototype.sub = function(rhs) {

  this.x -= rhs.x
  this.y -= rhs.y
  
  return this

}
