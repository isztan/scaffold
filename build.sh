#!/bin/bash
echo Checking NPM Dependencies...
npm install
echo

boiledjs -v -t browser src/target.js > scaffold.js.tmp
mv scaffold.js.tmp scaffold.js
