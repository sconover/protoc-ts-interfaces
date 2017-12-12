#!/usr/bin/env node

var dist = require("./dist.js")
dist.transformStream(process.stdin, process.stdout)