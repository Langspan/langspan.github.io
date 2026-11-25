import { build, transform } from 'esbuild'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const out = resolve(here, '../assets/coordination-demo.js')
const licenses = await Promise.all([
  readFile(resolve(here, 'vendor/stageshow/LICENSE'), 'utf8'),
  readFile(resolve(here, 'node_modules/react/LICENSE'), 'utf8'),
  readFile(resolve(here, 'node_modules/react-dom/LICENSE'), 'utf8'),
  readFile(resolve(here, 'node_modules/scheduler/LICENSE'), 'utf8'),
])
const licenseHeader = `/*! LangSpan coordination illustration.\nStageshow (c) 2026 Benji Taylor, MIT. Vendored at 299140fafd08df55a9c234e610c3f64af3f45531.\n${licenses.join('\n\n')}\n*/`

// Each selected kit component brings its CSS. Inject it once so production
// remains a buildless site with one deferred, self-contained demo asset.
const inlineCSS = {
  name: 'inline-demo-css',
  setup(builder) {
    builder.onLoad({ filter: /\.css$/ }, async ({ path }) => {
      const css = await readFile(path, 'utf8')
      const result = await transform(css, { loader: 'css', minify: true, target: ['chrome111','safari16.5','firefox128'] })
      return { loader: 'js', contents: `const style = document.createElement('style');style.dataset.langspanDemo = '';style.textContent = ${JSON.stringify(result.code)};document.head.append(style);` }
    })
  },
}

await mkdir(dirname(out), { recursive: true })
const result = await build({
  absWorkingDir: here, entryPoints: ['CoordinationDemo.tsx'], outfile: out,
  bundle: true, minify: true, format: 'iife', platform: 'browser',
  target: ['chrome111','safari16.5','firefox128'], jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [inlineCSS], banner: { js: licenseHeader }, legalComments: 'inline',
  metafile: true,
})
await mkdir(resolve(here, '.build'), { recursive: true })
await writeFile(resolve(here, '.build/metafile.json'), JSON.stringify(result.metafile, null, 2))
console.log(`Built ${out}: ${result.metafile.outputs[out]?.bytes ?? Object.values(result.metafile.outputs)[0].bytes} bytes`)
