#!/usr/bin/env node

/**
 *
 * Run this service if you dont use webpack-dev-server to open editor
 * from search results.
 *
 * Usage:
 *   node openEditorService.js [optionalPort]
 *   cs-oes [optionalPort]
 *
 * Examples:
 *   node openEditorService.js
 *   cs-oes 5000
 *
 */

import http from 'http';
import launchEditor from 'react-dev-utils/launchEditor.js';

const port = process.argv[2] || 3000;
const WDS_LIKE_URL = '/__open-stack-frame-in-editor';

function handleRequest(request, response) {
  if (!request.url.startsWith(WDS_LIKE_URL)) {
    console.warn(`WARNING: openEditorService supports only ${WDS_LIKE_URL} url`);
    return;
  }
  const url = new URL('http://localhost' + request.url);
  const fileName = url.searchParams.get('fileName');
  const lineNumber = Number(url.searchParams.get('lineNumber'));
  if (!fileName) {
    console.warn('got request without fileName');
    return;
  }
  launchEditor(fileName, lineNumber);
  response.end();
}

const server = http.createServer(handleRequest);
server.listen(port, err => {
  if (err) throw err;

  console.log(`openEditorService was started on port ${port}`);
});
