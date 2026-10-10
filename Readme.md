# Full screen color picker

https://color.aurlien.net

## Build and run locally

Install the locked dependencies and generate the browser bundle:

```sh
npm ci
npm run build
```

Serve this directory over localhost (for example, with `python3 -m http.server 8000`) and open `http://localhost:8000`. The build creates `bundle.js`, which is intentionally ignored by Git.
