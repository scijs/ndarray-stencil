"use strict"

var zeros = require("zeros")
var ops = require("ndarray-ops")
var unpack = require("ndarray-unpack")
var proxy = require("ndarray-proxy")
var test = require("tape")
var createStencil = require("../stencil.js")

test("ndarray-stencil", function(t) {

  var diffuse = createStencil([[-1, 0], [1,0], [0,-1], [0,1]], function(a,b,c,d) {
    return 0.25*(a+b+c+d)
  })

  var x = zeros([5,5])
  x.set(2,2,1)
  
  var y = zeros([5,5])
  diffuse(y, x)

  t.same(unpack(y), [
    [0, 0, 0, 0, 0],
    [0, 0, 0.25, 0, 0],
    [0, 0.25, 0, 0.25, 0],
    [0, 0, 0.25, 0, 0],
    [0, 0, 0, 0, 0]])


  var addIdx = createStencil([[-1, 0], [1,0], [0,-1], [0,1]], function(a,b,c,d, i) {
    return 0.25*(a+b+c+d) + i[0]*10 + i[1]
  }, { useIndex: true })
  
  addIdx(y, x)
  t.same(unpack(y), [
    [0, 0, 0, 0, 0],
    [0, 0, 1.25, 2, 0],
    [0, 10.25, 11, 12.25, 0],
    [0, 20, 21.25, 22, 0],
    [0, 0, 0, 0, 0]])
    
  var lazyX = proxy([5,5], function(i,j) {
    return (i===2 && j===2) ? 1 : 0
  })
  ops.assigns(y, 0)
  diffuse(y, lazyX)
  t.same(unpack(y), [
    [0, 0, 0, 0, 0],
    [0, 0, 0.25, 0, 0],
    [0, 0.25, 0, 0.25, 0],
    [0, 0, 0.25, 0, 0],
    [0, 0, 0, 0, 0]])
  

  var lazyY = proxy([5,5], function(i,j) {
    return y.get(i,j)
  }, function(i,j,v) {
    return y.set(i,j,v)
  })
  
  ops.assigns(y, 0)
  diffuse(lazyY, lazyX)
  t.same(unpack(y), [
    [0, 0, 0, 0, 0],
    [0, 0, 0.25, 0, 0],
    [0, 0.25, 0, 0.25, 0],
    [0, 0, 0.25, 0, 0],
    [0, 0, 0, 0, 0]])


 var diffuseSame = createStencil([[-1, 0], [1,0], [0,-1], [0,1]], function(a,b,c,d) {
    return 0.25*(a+b+c+d)
  }, {sameOutput: true})
  ops.assigns(y, 255)
  diffuseSame(y.lo(1,1).hi(3,3), x)
  t.same(unpack(y), [
    [255, 255, 255, 255, 255],
    [255, 0, 0.25, 0, 255],
    [255, 0.25, 0, 0.25, 255],
    [255, 0, 0.25, 0, 255],
    [255, 255, 255, 255, 255]])

  t.end()
})