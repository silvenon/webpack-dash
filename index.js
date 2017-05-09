const path = require('path')
const fsp = require('fs-promise')
const shell = require('shelljs')
const flattenDeep = require('lodash/flattenDeep')
const parseFileContents = require('./html')
const saveRecords = require('./database')
const chalk = require('chalk')

const SRC = path.join(__dirname, 'webpack.js.org', 'build')
const DEST = path.join(
  __dirname,
  'webpack.docset',
  'Contents',
  'Resources',
  'Documents'
)
// folders in webpack.js.org/build
const SECTIONS = [
  { sourceDir: 'api', dashType: 'Guide' },
  { sourceDir: 'concepts', dashType: 'Guide' },
  { sourceDir: 'configuration', dashType: 'Guide' },
  { sourceDir: 'development', dashType: 'Guide' },
  { sourceDir: 'guides', dashType: 'Guide' },
  { sourceDir: 'loaders', dashType: 'Module' },
  { sourceDir: 'plugins', dashType: 'Plugin' },
  { sourceDir: 'pluginsapi', dashType: 'Plugin' },
  { sourceDir: 'support', dashType: 'Guide' },
]

async function prepareDestDirectory() {
  await fsp.mkdirs(DEST)
  await fsp.emptyDir(DEST)
}

async function writeAssets() {
  await shell.cp('-r', path.join(SRC, '*.css'), DEST)
  await shell.cp(path.join(SRC, 'assets', 'favicon.ico'), DEST)
}

async function writeIndexFile() {
  const data = await fsp.readFile(path.join(SRC, 'index.html'))
  await fsp.writeFile(
    path.join(DEST, 'index.html'),
    parseFileContents(data).document
  )
}

function getItemSrcAndDestPaths(item, sourceDir) {
  let src, dest

  // flattening file structure to make it easier to reference the CSS file
  // api/cli/index.html > api-cli.html
  if (item === 'index.html') {
    src = path.join(sourceDir, item)
    dest = `${sourceDir}.html`
    // api/cli/foo > api-cli-foo.html
  } else {
    src = path.join(sourceDir, item, 'index.html')
    dest = `${sourceDir}-${path.basename(item)}.html`
  }

  return {
    src,
    dest,
  }
}

function getDocumentRecords(doc, dashType, dest) {
  return [
    {
      type: dashType,
      name: doc.title,
      path: dest,
    },
  ].concat(
    doc.anchors.map(anchor => ({
      type: anchor.type,
      name: anchor.name,
      path: dest + anchor.href,
    }))
  )
}

// meat and potatoes
async function generateRecords() {
  const records = await Promise.all(
    SECTIONS.map(async section => {
      const items = await fsp.readdir(path.join(SRC, section.sourceDir))
      return Promise.all(
        items
          .map(item => getItemSrcAndDestPaths(item, section.sourceDir))
          .map(async itemPath => {
            const data = await fsp.readFile(path.join(SRC, itemPath.src))
            const doc = parseFileContents(data, section.sourceDir)
            if (!doc) return
            await fsp.writeFile(path.join(DEST, itemPath.dest), doc.html)
            return getDocumentRecords(doc, section.dashType, itemPath.dest)
          })
      )
    })
  )

  await saveRecords(flattenDeep(records).filter(Boolean))
}

async function createTarball() {
  await shell.exec('tar --exclude=".DS_Store" -czf webpack.tgz webpack.docset')
}

async function init() {
  await prepareDestDirectory()
  await writeAssets()
  await writeIndexFile()
  await generateRecords()
  await createTarball()
  console.log(chalk.green.bold('📦  webpack.docset & webpack.tgz built'))
}

try {
  init() // 🚀
} catch (error) {
  console.error(chalk.red(error.stack))
}
