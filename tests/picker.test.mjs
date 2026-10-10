import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = new URL('../', import.meta.url);
const bundle = await build({
  entryPoints: [fileURLToPath(new URL('js.js', root))],
  bundle: true,
  write: false,
  format: 'iife'
});

function picker(hash = '') {
  const events = {};
  const copied = [];
  function element() {
    const attributes = {};
    return {
      style: {}, value: '', className: '', listeners: {}, validationMessage: '',
      addEventListener(name, callback) { this.listeners[name] = callback; },
      appendChild() {}, focus() {}, select() {},
      setAttribute(name, value) { attributes[name] = value; },
      removeAttribute(name) { delete attributes[name]; },
      getAttribute(name) { return attributes[name] ?? null; },
      setCustomValidity(message) { this.validationMessage = message; },
      reportValidity() { this.reported = true; }
    };
  }
  const elements = Object.fromEntries(
    ['form', 'input', 'button', '#copy-status', '.xhair', 'head'].map(name => [name, element()])
  );
  let historyLength = 1;
  function normalized(value) { return value ? '#' + value.replace(/^#/, '') : ''; }
  const location = {
    get hash() { return hash; },
    set hash(value) {
      value = normalized(value);
      if (value !== hash) historyLength++;
      hash = value;
    }
  };
  const history = {
    get length() { return historyLength; },
    replaceState(state, title, value) { hash = normalized(value); }
  };
  const document = {
    body: element(),
    querySelector: name => elements[name],
    addEventListener(name, callback) { events[name] = callback; },
    createElement(tag) {
      const result = element();
      if (tag === 'canvas') {
        result.getContext = () => ({ fillRect() {} });
        result.toDataURL = () => 'data:image/png;base64,stub';
      }
      return result;
    }
  };
  const math = Object.create(Math);
  math.random = () => 0.5;
  vm.runInNewContext(bundle.outputFiles[0].text, {
    document,
    window: { innerWidth: 1200, innerHeight: 800, location, history, isSecureContext: true },
    navigator: { clipboard: { writeText(value) { copied.push(value); return Promise.resolve(); } } },
    Math: math
  });
  return {
    input: elements.input, document, location, history, copied,
    copy() { elements.button.listeners.click({ preventDefault() {} }); },
    scroll(deltaY, deltaMode = 0) { events.wheel({ deltaY, deltaMode, preventDefault() {} }); },
    submit(value) {
      elements.input.value = value;
      elements.input.listeners.input?.({});
      elements.form.listeners.submit({ preventDefault() {} });
    }
  };
}

test('scrolling a URL color preserves its hue and updates the URL without extra history entries', () => {
  const app = picker('#00FF00');
  app.scroll(10);
  assert.equal(app.input.value, '#05FF05');
  assert.equal(app.location.hash, app.input.value);
  assert.equal(app.history.length, 1);
});

test('scrolling a typed color starts at its actual lightness', () => {
  const app = picker('#FF0000');
  app.submit(' #369 ');
  assert.equal(app.input.value, '#336699');
  app.scroll(50);
  assert.equal(app.input.value, '#3973AC');
  assert.equal(app.location.hash, app.input.value);
});

test('zero scrolling preserves exact RGB values and the initial random color', () => {
  for (const hash of ['#2D6A91', '']) {
    const app = picker(hash);
    const selected = app.input.value;
    app.scroll(0);
    assert.equal(app.input.value, selected);
  }
});

test('scrolling back from white and black retains the chosen hue and saturation', () => {
  const app = picker('#00FF00');
  app.scroll(10000);
  assert.equal(app.input.value, '#FFFFFF');
  app.scroll(-10);
  assert.equal(app.input.value, '#FAFFFA');
  app.scroll(-10000);
  assert.equal(app.input.value, '#000000');
  app.scroll(10);
  assert.equal(app.input.value, '#000500');
});

test('pixel, line and page scroll units have consistent effects', () => {
  for (const [delta, mode] of [[40, 0], [1, 1], [0.05, 2]]) {
    const app = picker('#FF0000');
    app.scroll(delta, mode);
    assert.equal(app.input.value, '#FF1414');
  }
});

test('complete hex codes and color names are accepted', () => {
  for (const [value, expected] of [
    ['abc', '#AABBCC'], ['#abc', '#AABBCC'], ['  a1b2c3  ', '#A1B2C3'],
    ['#A1B2C3', '#A1B2C3'], [' BLUE ', '#0000FF'], ['deeppink', '#FF1493']
  ]) {
    const app = picker('#00FF00');
    app.submit(value);
    assert.equal(app.input.value, expected);
    assert.equal(app.location.hash, expected);
    assert.equal(app.input.validationMessage, '');
  }
});

test('invalid input leaves the selected color and URL intact and reports an error', () => {
  for (const value of [
    '', '12345', 'FF0000oops', 'deadbeef', '#1234', '#12345678', '#12G',
    '#blue', 'bluejunk', 'rgb(1,2,3)', 'constructor', '__proto__'
  ]) {
    const app = picker('#00FF00');
    const background = app.document.body.style.backgroundColor;
    app.submit(value);
    assert.equal(app.document.body.style.backgroundColor, background, value);
    assert.equal(app.location.hash, '#00FF00', value);
    assert.equal(app.input.value, value);
    assert.ok(app.input.validationMessage, value);
    assert.equal(app.input.getAttribute('aria-invalid'), 'true');
    assert.equal(app.input.reported, true);
  }
});

test('editing after invalid input clears the error and allows a valid submission', () => {
  const app = picker('#00FF00');
  app.submit('12345');
  assert.ok(app.input.validationMessage);
  app.submit('red');
  assert.equal(app.input.value, '#FF0000');
  assert.equal(app.input.validationMessage, '');
  assert.equal(app.input.getAttribute('aria-invalid'), null);
});

test('copy rejects invalid input and preserves the selected color', () => {
  const app = picker('#00FF00');
  app.input.value = 'FF0000oops';
  app.copy();
  assert.deepEqual(app.copied, []);
  assert.equal(app.location.hash, '#00FF00');
  assert.ok(app.input.validationMessage);
});

test('copy normalizes a valid unsubmitted color name to a hex code', () => {
  const app = picker('#00FF00');
  app.input.value = 'deeppink';
  app.copy();
  assert.deepEqual(app.copied, ['#FF1493']);
  assert.equal(app.input.value, '#FF1493');
  assert.equal(app.location.hash, '#FF1493');
});

test('copying at a lightness limit preserves hue for the next scroll', () => {
  for (const [limit, next, expected] of [[10000, -10, '#FAFFFA'], [-10000, 10, '#000500']]) {
    const app = picker('#00FF00');
    app.scroll(limit);
    app.copy();
    app.scroll(next);
    assert.equal(app.input.value, expected);
  }
});
