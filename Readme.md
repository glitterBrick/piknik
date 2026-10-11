# piknik — full-screen color picker

Move your mouse to explore colors, click to hold one, and copy its hex code.
A small app for desktop browsers, with a downloadable version that works offline.

**[Download piknik-offline.html](https://github.com/glitterBrick/piknik/releases/latest/download/piknik-offline.html)**
· [Release notes](https://github.com/glitterBrick/piknik/releases/latest)
· [Source code](https://github.com/glitterBrick/piknik/tree/work)

[Use the picker](#use-the-picker) · [Develop locally](#develop-locally)
· [Build offline](#build-the-offline-file) · [Source map](#source-map)
· [Check your changes](#check-your-changes) · [Publish a release](#publish-a-release)

This is [glitterBrick's fork](https://github.com/glitterBrick/piknik) of
[arnemart/piknik](https://github.com/arnemart/piknik), created by **Arne Martin Aurlien**.
The [original author's demo](https://color.aurlien.net) runs the original project;
download or build this fork to try its changes.

## Use the picker

Download **piknik-offline.html**, save it, and double-click it to open it in a
desktop browser. It includes the code and styles, so it works without internet
access or installing development tools.

| Action | Result |
| --- | --- |
| Move left or right | Change hue |
| Move up or down | Change saturation |
| Scroll | Change lightness, keeping the selected hue and saturation |
| Click the background | Lock the color and enable the controls; click again to resume picking |
| Enter a color while locked, then press Enter | Apply a 3- or 6-digit hex code (`#F80`, `FF8800`) or a color name (`blue`) |
| Click **copy** | Apply valid input and copy its normalized hex code |

Invalid input shows an error and keeps the selected color. If automatic copying
is unavailable, the code is selected for you: press `Ctrl+C` on Windows/Linux or
`Cmd+C` on macOS.

Locking a color puts its hex code in the URL; scrolling while locked updates it.
For example, `http://localhost:8000/#00FF00` opens with green selected. You can
also append `#00FF00` to the offline file's address.

On the [Releases page](https://github.com/glitterBrick/piknik/releases), choose
**piknik-offline.html** under **Assets**. GitHub's **Source code** archives contain
the editable project and require a build step. Offline builds omit the online
Star and Share controls.

## Develop locally

These are the shared starting steps for human contributors and AI agents.
Piknik is a static HTML/CSS/JavaScript app: Node.js builds the browser code, and a
static server serves it. There is no application backend or API to start.

Use **Node.js 24 LTS** with npm, matching the release workflow. You also need Git
for cloning and Python 3 (or another static HTTP server) to preview the online page.
The default branch is `master`; development for this fork happens on `work`.

```sh
git clone --branch work https://github.com/glitterBrick/piknik.git
cd piknik
npm ci
npm run build
python3 -m http.server 8000 --bind 127.0.0.1
```

For an existing checkout, start at `npm ci` in the repository root. It installs
the versions in `package-lock.json`; `npm run build` creates **bundle.js**, which
`index.html` loads.

Open [http://localhost:8000](http://localhost:8000) on the same machine. In a remote
environment, use its preview or forwarding feature for port 8000. Press `Ctrl+C`
in the server terminal to stop it.

Preview `index.html` through the server. Clipboard access needs a secure browser
context such as localhost or HTTPS; manual copying remains available.

To work on the JavaScript, keep the server running and start this in a second
terminal at the repository root:

```sh
npm run watch
```

JavaScript changes rebuild automatically; refresh the browser to see them.
HTML and CSS edits only need a refresh. Press `Ctrl+C` to stop watching.

## Build the offline file

After cloning or unpacking the source and running `npm ci`, run this from the
repository root:

```sh
npm run build:offline
```

The result is **dist/piknik-offline.html**. Double-click it to use it or send the
file to someone else. This build needs no local server; rebuild it after source
changes.

The build embeds `styles.css` and bundled `js.js` into `index.html`, omitting
sections marked `online-only`. An HTML comment includes author credits,
dependency licenses, and the source revision. Builds without Git metadata are
labeled `source archive`.

## Source map

| File | Role |
| --- | --- |
| [index.html](index.html) | Page structure, controls, and shared offline template |
| [styles.css](styles.css) | Layout and appearance |
| [js.js](js.js) | Color picking, scrolling, input validation, copying, and URL behavior |
| [package.json](package.json) | Dependencies and build, watch, and test commands |
| [package-lock.json](package-lock.json) | Exact versions for repeatable installs |
| [scripts/build-offline.mjs](scripts/build-offline.mjs) | Standalone HTML packaging and credit/license embedding |
| [tests/picker.test.mjs](tests/picker.test.mjs) | Regression tests that exercise the actual picker code |
| [.github/workflows/release.yml](.github/workflows/release.yml) | Tests and publishes the offline file for version tags |
| [.github/release-notes.md](.github/release-notes.md) | Notes used when publishing a release |

Commit source changes and intentional lockfile updates. Generated
`node_modules/`, `bundle.js`, `bundle.js.map`, and `dist/` are ignored by Git.

## Check your changes

From the repository root, after `npm ci`:

```sh
npm test
npm run build
npm run build:offline
```

The tests cover color input, copy normalization, scrolling, and URL regressions.
They bundle the actual picker code and run in Node.js with a simulated DOM;
check the browser behavior as well:

1. Open `http://localhost:8000/#00FF00`. Scroll while locked: the hue should stay
   green and the URL should match the displayed hex code.
2. Enter `#F80` and then `blue`: each should become a full hex code. Enter `#12G`:
   an error should appear and the selected color should stay unchanged.
3. Click **copy** and paste into a text field. If clipboard access is unavailable,
   check the selected-code fallback with `Ctrl+C` or `Cmd+C`.
4. Open `dist/piknik-offline.html` with internet access disabled. Check picking,
   locking, scrolling, and copying; Star and Share should be absent.

When handing off a change, state which commands and browser checks you ran,
their results, and any checks you could not complete.

## About this fork

This fork adds an offline build, replaces Browserify/Watchify/Uglifyify with
esbuild, updates the color conversion library, and locks dependency versions.
It also fixes wheel scrolling and locked-color URLs, validates complete hex inputs,
adds clipboard feedback and a fallback, corrects the PNG favicon, and removes the
old Twitter widget script.

The online page's Star and Share links still point to the original project and
demo. Changes here do not update the original author's website.

## Publish a release

1. Update [.github/release-notes.md](.github/release-notes.md) and commit the changes.
2. Choose a tested source commit, give it a version tag such as `v0.2.0`, and
   push the tag to this fork. **Pushing a `v*` tag triggers publication.**
3. The [release workflow](.github/workflows/release.yml) installs locked
   dependencies, runs `npm test`, and builds the offline file from that tag.
   If those steps pass, it publishes a release with **piknik-offline.html** attached.
4. Check the [Actions page](https://github.com/glitterBrick/piknik/actions) and
   try the release download without internet access.

Keep generated HTML out of source commits and attach it to releases. GitHub's
source archives contain the source for the same tag.

To publish the website, build `bundle.js` and serve it alongside `index.html`
and `styles.css`. Pushing source code to GitHub alone does not deploy a website.
