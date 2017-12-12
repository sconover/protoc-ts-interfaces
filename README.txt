- generate ts interfaces via protoc plugin
- reuses parts of https://github.com/improbable-eng/ts-protoc-gen

dev setup:
- install bazel
- build prep: bazel run @nodejs//:npm install
  - this is a wart, replace with fully-hermetic npm management once that matures in rules_nodejs
- to build: bazel build //...
  - the first run will take a while, mainly because protoc must be built from source
  - this includes usage of the plugin to gen d.ts's for the various scenarios in the scenarios directory
- to run tests: bazel test //...
- followed http://blog.npmjs.org/post/118810260230/building-a-simple-command-line-tool-with-npm to make the cli and publish the package to the npm repo