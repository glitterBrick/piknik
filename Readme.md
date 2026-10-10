# piknik — full-screen color picker

Move your mouse to explore colors, click to hold one, and copy its hex code.

This is [glitterBrick's fork](https://github.com/glitterBrick/piknik) of
[arnemart/piknik](https://github.com/arnemart/piknik), originally created by
**Arne Martin Aurlien**. The `work` branch is where this fork's development
happens, starting with updates to the build tools and browser compatibility.

**Original author's demo:** [color.aurlien.net](https://color.aurlien.net).
That website belongs to the original maintainer. Changes in this fork do not
update it; run this fork locally to try its version.

## What has changed in this fork

- Replaced Browserify, Watchify, and Uglifyify with esbuild.
- Updated the color conversion library and added a dependency lockfile.
- Switched scrolling to the standard `wheel` event, including support for
  different scroll units.
- Added clipboard success feedback and a manual-copy fallback.
- Corrected the generated favicon's image format and removed the old Twitter
  widget script.

The page's Star and Share links still point to the original project and demo.

## Run it locally

You need:

- Git to download the repository.
- **Node.js 24 LTS**, with npm. The build has been checked with Node.js 24.19.0;
  the current build tool requires Node.js 18 or newer.
- Python 3 for the simple local server below, or another static HTTP server.

Download the development branch:

```sh
git clone --branch work https://github.com/glitterBrick/piknik.git
cd piknik
```

If you already have the repository open on `work`, start here:

```sh
npm ci
npm run build
python3 -m http.server 8000 --bind 127.0.0.1
```

`npm ci` installs the exact dependency versions in `package-lock.json`.
`npm run build` turns the source JavaScript into `bundle.js`, which the page
loads. The Python command serves the files locally.

Open [http://localhost:8000](http://localhost:8000) in a browser on the same
machine as the server. If you are working in a remote development environment,
use its port preview or forwarding feature for port 8000. Press `Ctrl+C` in the
server terminal to stop it.

Use a local server rather than opening `index.html` directly. Clipboard copying
needs a secure browser context, such as localhost or HTTPS; if it is unavailable,
the app selects the color code so you can copy it manually.

## Use the picker

- Move left or right to change hue, and up or down to change saturation.
- Scroll to change lightness.
- Click the background to lock the color and use the controls. Click the
  background again to resume picking.
- While locked, enter a hex code such as `#FF8800` or a color name such as `blue`,
  then press Enter.
- Click **copy** to copy the displayed hex code.
- Locking a color puts its hex code in the URL. For example,
  `http://localhost:8000/#00FF00` opens with green selected.

There is a known scrolling issue after loading a color from the URL or entering
one manually: scrolling can change its hue as well as its lightness, and the URL
can retain the previous color. Input validation also needs improvement.

## Make changes

Keep the local server running. In a second terminal, from the repository
directory, run:

```sh
npm run watch
```

This rebuilds the JavaScript when you save changes. Refresh the browser to see
the result. HTML and CSS edits only need a refresh. Press `Ctrl+C` to stop watching.

| File | What it does |
| --- | --- |
| `index.html` | Page structure and controls |
| `styles.css` | Layout and appearance |
| `js.js` | Color picking, scrolling, copying, and URL behavior |
| `package.json` | Dependencies and build commands |
| `package-lock.json` | Exact dependency versions for repeatable installs |

Commit source changes and intentional lockfile updates. `node_modules/` and
`bundle.js` are generated and ignored by Git. The watch command also generates
`bundle.js.map`; it is currently not ignored, so leave it out of commits.

This is a static website. Publishing this fork requires building `bundle.js` and
serving it alongside `index.html` and `styles.css`. Pushing code to GitHub does
not by itself deploy a website.
