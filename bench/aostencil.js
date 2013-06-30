var compileStencil = require("../stencil.js")
var zeros = require("zeros")

var aoPass = compileStencil([
  [ 0,-1,-1], [ 0,-1, 0], [ 0,-1, 1],
  [ 0, 0,-1], [ 0, 0, 0], [ 0, 0, 1],
  [ 0, 1,-1], [ 0, 1, 0], [ 0, 1, 1],
  [ 1,-1,-1], [ 1,-1, 0], [ 1,-1, 1],
  [ 1, 0,-1], [ 1, 0, 0], [ 1, 0, 1],
  [ 1, 1,-1], [ 1, 1, 0], [ 1, 1, 1]],
  function Empty(a,b,c,d,e,f,g,h) { return 0 }, {debug:true})

var x = zeros([33,33,33])
var y = zeros([33,33,33])

for(var i=0; i<1000; ++i) {
  aoPass(x, y)
}

