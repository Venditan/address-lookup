#!/usr/bin/env bash

NPM_IMAGE="node:$(cat .nvmrc)-alpine"

docker run -it  -v `pwd`:"/app" -w "/app" "${NPM_IMAGE}" sh -c "npm install; npm run build"
