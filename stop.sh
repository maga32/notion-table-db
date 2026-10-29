#!/bin/bash
cd -- "$(dirname -- "$0")" || exit
pkill -f "^node $PWD/notion-table\\.js$"
