import convert from 'color-convert';

var x = 0, y = 0, z = 50;

var picking = true;

var dark = false;

var current;
var currentHex;

var form = document.querySelector('form');
var input = document.querySelector('input');
var button = document.querySelector('button');
var copyStatus = document.querySelector('#copy-status');
var div = document.querySelector('.xhair');

var canvas = document.createElement('canvas');
canvas.width = 16;
canvas.height = 16;
var ctx = canvas.getContext('2d');

var link = document.createElement('link');
link.type = 'image/png';
link.rel = 'icon';
document.querySelector('head').appendChild(link);

document.addEventListener('mousemove', function(e) {
  if (picking) {
    x = e.clientX;
    y = e.clientY;
    setColor();
  }
});

document.addEventListener('wheel', function(e) {
  e.preventDefault();
  var deltaY = e.deltaY;
  if (e.deltaMode === 1) {
    deltaY *= 40;
  } else if (e.deltaMode === 2) {
    deltaY *= window.innerHeight;
  }
  z = Math.max(0, Math.min(100, z + deltaY / 10));
  setHSL(current[0], current[1], z);
}, { passive: false });

function setHSL(h, s, l) {
  current = [h, s, l];
  z = l;
  renderColor('#' + convert.hsl.hex(h, s, l));
}

function setColor(r, g, b) {
  if (r != null) {
    current = convert.rgb.hsl.raw(r, g, b);
    z = current[2];
    renderColor('#' + convert.rgb.hex(r, g, b));
  } else {
    var h = x / window.innerWidth * 360;
    var s = 100 - (y / window.innerHeight * 100);
    setHSL(h, s, z);
  }
}

function renderColor(hex) {
  currentHex = hex;
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, 16, 16);
  link.href = canvas.toDataURL('image/png');
  document.title = hex;

  if (dark && current[2] >= 40) {
    dark = false;
    div.className = 'xhair dark';
  } else if (!dark && current[2] < 40) {
    dark = true;
    div.className = 'xhair light';
  }
  document.body.style.backgroundColor = hex;
  input.value = hex;
  clearInputError();
  copyStatus.textContent = '';
  if (!picking) {
    positionCrosshair();
    window.history.replaceState(null, '', hex);
  }
}

button.addEventListener('click', function(e) {
  e.preventDefault();
  if (!applyInputColor()) {
    return;
  }
  if (!window.isSecureContext || !navigator.clipboard || !navigator.clipboard.writeText) {
    input.focus();
    input.select();
    copyStatus.textContent = 'Select and copy the color';
    return;
  }

  navigator.clipboard.writeText(input.value).then(function() {
    copyStatus.textContent = 'Copied';
  }, function() {
    input.focus();
    input.select();
    copyStatus.textContent = 'Copy unavailable; select the color';
  });
});

form.addEventListener('submit', function(e) {
  e.preventDefault();
  applyInputColor();
});

function applyInputColor() {
  // Re-parsing an unchanged black or white hex would erase the saved hue.
  if (input.value !== currentHex && !fromString(input.value)) {
    input.setCustomValidity('Enter a 3- or 6-digit hex code, or a color name such as blue.');
    input.setAttribute('aria-invalid', 'true');
    input.reportValidity();
    return false;
  }
  clearInputError();
  lock();
  return true;
}

function clearInputError() {
  input.setCustomValidity('');
  input.removeAttribute('aria-invalid');
}

input.addEventListener('input', clearInputError);
input.addEventListener('focus', input.select);
input.addEventListener('click', input.select);

document.addEventListener('click', function(e) {
  if (e.target.tagName == 'HTML' || e.target.tagName == 'BODY') {
    if (picking) {
      lock();
    } else {
      unlock(e);
    }
  }
});

function lock() {
  picking = false;
  document.body.className = "";
  positionCrosshair();
  if (currentHex) {
    window.location.hash = currentHex;
  }
}

function positionCrosshair() {
  if (current) {
    var x = current[0] / 360 * window.innerWidth;
    var y = (100 - current[1]) / 100 * window.innerHeight;
    div.style.transform = 'translateX(' + x +'px) translateY(' + y + 'px)';
  }
}

function unlock(e) {
  picking = true;
  if (e) {
    x = e.clientX;
    y = e.clientY;
    setColor();
  }
  window.location.hash = '';
  document.body.className = "picking";
}

function fromString(str) {
  str = str.trim();
  var matches = str.match(/^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/);
  if (matches) {
    setColor.apply(null, convert.hex.rgb(matches[1]));
    return true;
  } else if (/^[a-z]+$/i.test(str)) {
    try {
      setColor.apply(null, convert.keyword.rgb(str.toLowerCase()));
      return true;
    } catch (e) { }
  }
  return false;
}

if (fromString(window.location.hash)) {
  lock();
} else {
  document.body.className = "picking";
  setHSL(Math.round(Math.random() * 360), Math.round(Math.random() * 100), 50);
}
