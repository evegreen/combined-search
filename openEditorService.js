'use strict';

/**
 *
 * Run this service if you dont use webpack-dev-server to open editor
 * from search results.
 *
 * Usage:
 *   node openEditorService.js [optionalPort]
 *
 * Examples:
 *   node openEditorService.js
 *   node openEditorService.js 5000
 *
 */

const http = require('http');
const url = require('url');
const querystring = require('querystring');
const launchEditor = require('react-dev-utils/launchEditor');

const port = process.argv[2] || 3000;
const WDS_LIKE_URL = '/__open-stack-frame-in-editor';

function handleRequest(request, response) {
  if (!request.url.startsWith(WDS_LIKE_URL)) {
    console.warn(`WARNING: openEditorService supports only ${WDS_LIKE_URL} url`);
    return;
  }

  const parsedUrl = url.parse(request.url);
  const parsedQuery = querystring.parse(parsedUrl.query);
  const fileName = parsedQuery.fileName;
  const lineNumber = Number(parsedQuery.lineNumber);
  launchEditor(fileName, lineNumber);
  response.end();
}

const server = http.createServer(handleRequest);
server.listen(port, err => {
  if (err) throw err;

  console.log(`openEditorService was started on port ${port}`);
});
