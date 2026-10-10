The first downloadable offline release of glitterBrick's piknik fork, based on
the original project by Arne Martin Aurlien.

## Download and use

Download **piknik-offline.html** from **Assets**, save it to your computer, and
double-click it to open it in a desktop browser. The file includes the code,
styles, and color conversion library. It needs no installation, local server,
or internet connection.

Move the mouse to choose a color, click the background to lock it, scroll to
change its lightness, and click **copy** for the hex code. You can also enter a
3- or 6-digit hex code or a color name while locked.

## Included in this version

- A repeatable single-file offline build with original-author credits and
  dependency licenses included.
- Scrolling that preserves the selected hue and saturation and keeps the
  locked color's URL current, including colors loaded from a URL or typed in.
- Full input validation, error feedback, and copying of normalized hex codes.
- A modern esbuild-based development setup and 11 regression tests.

Clipboard access depends on the browser. If automatic copying is unavailable,
the app selects the hex code so you can press **Ctrl+C** or **Cmd+C**.

GitHub's **Source code** ZIP and tar archives contain the editable source for
this version. Those require a build step; choose **piknik-offline.html** for the
ready-to-use picker.

Original project: https://github.com/arnemart/piknik
