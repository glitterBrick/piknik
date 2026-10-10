import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist', 'piknik-offline.html');

function replaceOnce(html, placeholder, replacement) {
  if (html.split(placeholder).length !== 2) {
    throw new Error(`Expected exactly one ${placeholder} in index.html`);
  }
  return html.replace(placeholder, () => replacement);
}

function sourceRevision() {
  try {
    return execFileSync('git', ['describe', '--tags', '--always', '--dirty'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return 'source archive';
  }
}

async function buildOffline() {
  const [template, styles, bundle, ...licenses] = await Promise.all([
    readFile(join(root, 'index.html'), 'utf8'),
    readFile(join(root, 'styles.css'), 'utf8'),
    build({
      absWorkingDir: root,
      entryPoints: ['js.js'],
      bundle: true,
      minify: true,
      write: false,
      format: 'iife',
      platform: 'browser',
      legalComments: 'inline'
    }),
    ...['color-convert', 'color-name'].map(async name => {
      const license = await readFile(join(root, 'node_modules', name, 'LICENSE'), 'utf8');
      return `${name}\n${license}`;
    })
  ]);

  const onlineSections = /<!-- online-only:start -->[\s\S]*?<!-- online-only:end -->/g;
  let html = template.replace(onlineSections, '');
  if (/<!-- online-only:/.test(html)) {
    throw new Error('Unmatched online-only marker in index.html');
  }

  html = replaceOnce(html, '<title>Colors</title>', '<title>piknik — offline color picker</title>');
  // Escape closing tags so source text cannot end the surrounding HTML element.
  html = replaceOnce(html, '<link rel="stylesheet" href="styles.css">',
    `<style>\n${styles.replace(/<\/style/gi, '<\\/style')}\n</style>`);
  const javascript = bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  html = replaceOnce(html, '<script src="bundle.js"></script>',
    `<script>\n${javascript}\n</script>`);

  // Fail instead of quietly publishing a file that still loads scripts or styles.
  if (/<script\b[^>]*\bsrc\s*=|<link\b[^>]*\brel\s*=\s*["']stylesheet["']/i.test(html)) {
    throw new Error('Offline output still references an external script or stylesheet');
  }

  const credits = [
    'piknik offline build',
    `Source revision: ${sourceRevision()}`,
    'Original project by Arne Martin Aurlien: https://github.com/arnemart/piknik',
    'Fork: https://github.com/glitterBrick/piknik',
    '',
    'Third-party licenses:',
    '',
    ...licenses
  ].join('\n').replace(/--/g, '—');
  html = replaceOnce(html, '<!DOCTYPE html>', `<!DOCTYPE html>\n<!--\n${credits}\n-->`);

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
  console.log(`Built ${output} (${Buffer.byteLength(html)} bytes)`);
}

buildOffline().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
