#!/bin/bash
boiledjs -v -t browser src/target.js > scaffold.js.tmp
mv scaffold.js.tmp scaffold.js
