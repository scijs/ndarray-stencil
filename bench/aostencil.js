var compileStencil = require("../stencil.js")
var ndarray = require("ndarray")

var aoPass = compileStencil([
  [ 0,-1,-1], [ 0,-1, 0], [ 0,-1, 1],
  [ 0, 0,-1], [ 0, 0, 0], [ 0, 0, 1],
  [ 0, 1,-1], [ 0, 1, 0], [ 0, 1, 1],
  [ 1,-1,-1], [ 1,-1, 0], [ 1,-1, 1],
  [ 1, 0,-1], [ 1, 0, 0], [ 1, 0, 1],
  [ 1, 1,-1], [ 1, 1, 0], [ 1, 1, 1]],
  function Empty(a,b,c,d,e,f,g,h) { return 0 }, {debug:true})

var x = ndarray(new Uint32Array(33*33*33), [33,33,33])
var y = ndarray(new Uint32Array(33*33*33), [33,33,33])

for(var i=0; i<3000; ++i) {
  aoPass(x, y)
}

