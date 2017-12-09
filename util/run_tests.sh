#!/bin/bash -e

exec node_modules/mocha/bin/mocha --compilers ts:ts-node/register,tsx:ts-node/register --ui tdd test/*_test.ts