"use strict"

var dup = require("dup")
var cwise = require("cwise")

function generateCWiseLoop(n, d, func) {
  var body_args = []
  var args = ["scalar", "array"]
  for(var i=0; i<n; ++i) {
    args.push("array")
    body_args.push("a"+i)
  }
  
  args.push("index")
  body_args.push("idx")

  body_args.push(["out=func(",body_args.join(","),")"].join(""))
  body_args.unshift("out")
  body_args.unshift("func")
  
  var loop = cwise({
    args: args,
    body: Function.apply(undefined, body_args),
    funcName: "StencilOp"
  })
  
  return loop.bind(undefined, func)
}

function hiOffset(hi, point) {
  var out = new Array(point.length)
  for(var i=0; i<hi.length; ++i) {
    var d = -point[i]-hi[i]
    if(d === 0) {
      out[i] = "s" + i
    } else {
      out[i] = ["s", i, "-", (-d)].join("")
    }
  }
  return out.join(",")
}

function loOffset(lo, point) {
  var out = new Array(point.length)
  for(var i=0; i<lo.length; ++i) {
    var d = -lo[i]-point[i]
    if(d === 0) {
      out[i] = "0"
    } else  {
      out[i] = d
    }
  }
  return out.join(",")
}

function generateWrapper(points, lo, hi, loop) {
  var n = points.length
  var d = lo.length
  var code = ["'use strict'"]
  code.push("var s=out.shape")
  for(var i=0; i<d; ++i) {
    code.push(["var s", i, "=s[", i, "]|0"].join(""))
  }
  code.push(["func(out.hi(", hiOffset(hi, dup(d)), ").lo(", loOffset(lo, dup(d)), ")"].join(""))
  for(var i=0; i<points.length; ++i) {
    code.push([",inp.hi(", hiOffset(hi, points[i]), ").lo(", loOffset(lo, points[i]), ")"].join(""))
  }
  code.push(")")
  var proc = new Function("func", "out", "inp", code.join("\n"))
  return proc.bind(undefined, loop)
}

function stencilOp(points, func) {
  if(points.length === 0) {
    throw new Error("ndarray-stencil: Need to specify at least one point for stencil")
  }
  var n = points.length
  var d = points[0].length
  var lo = dup(d)
  var hi = dup(d)
  for(var i=0; i<n; ++i) {
    var p = points[i]
    for(var j=0; j<d; ++j) {
      lo[j] = Math.min(lo[j], p[j])
      hi[j] = Math.max(hi[j], p[j])
    }
  }
  var cwiseLoop = generateCWiseLoop(n, d, func)
  return generateWrapper(points, lo, hi, cwiseLoop)
}

module.exports = stencilOp