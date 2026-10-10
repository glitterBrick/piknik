# piknik — full-screen color picker

Move your mouse to explore colors, click to hold one, and copy its hex code.

**[Download an offline release](https://github.com/glitterBrick/piknik/releases)**
or **[get the source code](https://github.com/glitterBrick/piknik/tree/work)**.

This is [glitterBrick's fork](https://github.com/glitterBrick/piknik) of
[arnemart/piknik](https://github.com/arnemart/piknik), originally created by
**Arne Martin Aurlien**. The `work` branch is where this fork's development
happens, starting with updates to the build tools and browser compatibility.

**Original author's demo:** [color.aurlien.net](https://color.aurlien.net).
That website belongs to the original maintainer. Changes in this fork do not
update it; run this fork locally to try its version.

## Download the offline picker

Open this fork's [Releases page](https://github.com/glitterBrick/piknik/releases)
and download **`piknik-offline.html`** from a release's **Assets** section.
Save it to your computer and double-click it to open it in your browser.

The offline file includes the styles, JavaScript, and color conversion library.
It works without internet access, Node.js, or a local server. Online Star and
Share controls are omitted. If your browser blocks clipboard access, click
**copy**, then press `Ctrl+C` on Windows/Linux or `Cmd+C` on macOS to copy the
selected code manually.

GitHub's **Source code** ZIP and tar downloads contain the editable project;
they need a build step. For a file you can open immediately, choose
`piknik-offline.html`. If that asset is not available yet, build it from source
using the instructions below.

## What has changed in this fork

- Added a single-file offline build for downloadable releases.
- Replaced Browserify, Watchify, and Uglifyify with esbuild.
- Updated the color conversion library and added a dependency lockfile.
- Switched scrolling to the standard `wheel` event, including support for
  different scroll units.
- Fixed scrolling to preserve the selected hue and saturation and update the
  locked color's URL.
- Added complete hex-code validation and feedback for invalid color inputs.
- Added clipboard success feedback and a manual-copy fallback.
- Corrected the generated favicon's image format and removed the old Twitter
  widget script.

The online page's Star and Share links still point to the original project and demo.

## Build the offline file from source

Use **Node.js 24 LTS** with npm. The build has been checked with Node.js 24.19.0;
the current build tool requires Node.js 18 or newer. Git is needed for cloning,
but building a downloaded source archive also works.

```sh
git clone --branch work https://github.com/glitterBrick/piknik.git
cd piknik
npm ci
npm run build:offline
```

If you already have the repository open, run the last two commands from its
directory. The result is **`dist/piknik-offline.html`**. Double-click that file
to use it, or send the HTML file to someone else. Rebuild it after source changes.

The build embeds `styles.css` and a bundled version of `js.js` into the shared
`index.html` template. Sections marked `online-only` are omitted. Author credits,
dependency licenses, and the source revision are included in an HTML comment.
Source archives without Git metadata are labeled `source archive`.

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

For the online page, use a local server rather than opening `index.html` directly.
The generated offline file can be opened directly. Clipboard copying
needs a secure browser context, such as localhost or HTTPS; if it is unavailable,
the app selects the color code so you can copy it manually.

## Use the picker

- Move left or right to change hue, and up or down to change saturation.
- Scroll to change lightness while keeping the selected hue and saturation.
- Click the background to lock the color and use the controls. Click the
  background again to resume picking.
- While locked, enter a 3- or 6-digit hex code such as `#F80` or `#FF8800`
  (the `#` is optional), or a color name such as `blue`, then press Enter.
  Invalid input displays an error and keeps the selected color.
- Click **copy** to copy the hex code. A valid typed color is applied first;
  invalid input displays an error instead of being copied.
- Locking a color puts its hex code in the URL. For example,
  `http://localhost:8000/#00FF00` opens with green selected. You can also append
  `#00FF00` to the offline file's address.

Scrolling a locked color updates its URL, including colors loaded from a URL or
entered manually.

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
| `scripts/build-offline.mjs` | Packages the source into a standalone HTML file |

Commit source changes and intentional lockfile updates. `node_modules/` and
`bundle.js` are generated and ignored by Git, along with the watch command's
`bundle.js.map` and the offline build's `dist/` directory.

Run `npm test` to check color input and scrolling regressions. These tests bundle
the actual picker code and exercise its events without needing a browser.

## Publish a release

1. Choose a tested source commit and give it a version tag, such as `v0.1.0`.
2. From that exact commit, run `npm ci` and `npm run build:offline`.
3. Create a GitHub release for the tag and attach `dist/piknik-offline.html`
   as a downloadable asset. Describe the changes and known limitations.
4. Check that the attached file opens and works without internet access.

GitHub supplies source code ZIP and tar archives for the same tag. The HTML
attachment is the ready-to-use version; the archives are the source for that
version. Keep the generated HTML out of source commits and attach it to releases.

This is a static website. Publishing this fork requires building `bundle.js` and
serving it alongside `index.html` and `styles.css`. Pushing code to GitHub does
not by itself deploy a website.
