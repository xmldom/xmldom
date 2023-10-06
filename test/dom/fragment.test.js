'use strict';

const { describe, expect, test } = require('@jest/globals');

  const { XML_TEXT } = require('../../lib/conventions').MIME_TYPE;
  const { DOMParser } = require('../../lib/dom-parser');
  const { XMLSerializer } = require('../../lib/dom');

  test('append empty fragment', () => {
    const document = new DOMParser().parseFromString('<p id="p"/>', XML_TEXT);
    const fragment = document.createDocumentFragment();
    fragment.appendChild(document.createTextNode('a'));
    document.getElementById('p').insertBefore(fragment, null);
    expect(new XMLSerializer().serializeToString(document))
      .toBe('<p id="p">a</p>');
  });
