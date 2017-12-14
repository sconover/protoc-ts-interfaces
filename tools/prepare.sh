#!/bin/bash -e

# npm publish doesn't want to publish symlinks,
# so nuke the link and copy the real file in place.
# we have to remember not to commit this change to the 
# git repo.
#
# sigh.
#
# along those lines, this script is not idempotent.
# you need to
# git checkout bin/dist.js
# in order to re-run it.

this_dir=$(dirname $0)
symlink_target=$this_dir/../bin/$(ls -l $this_dir/../bin/dist.js | sed -e 's/.* -> //')
rm -f $this_dir/../bin/dist.js
cp $symlink_target $this_dir/../bin/dist.js
