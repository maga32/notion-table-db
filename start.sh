#!/bin/bash
cd -- "$(dirname -- "$0")" || exit
nohup node "$PWD/notion-table.js" >/dev/null 2>&1 &
