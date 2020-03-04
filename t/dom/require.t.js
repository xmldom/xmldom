#!/usr/bin/env node

require('proof')(1, function (ok) {
  ok(require('../../lib/dom-parser'), 'require');
});
