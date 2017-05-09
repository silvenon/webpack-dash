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

function writeAssets() {
  return Promise.resolve()
    .then(() => shell.cp('-r', path.join(SRC, '*.css'), DEST))
    .then(() => shell.cp(path.join(SRC, 'assets', 'favicon.ico'), DEST))
}

function writeIndexFile() {
  return fsp
    .readFile(path.join(SRC, 'index.html'))
    .then(data =>
      fsp.writeFile(
        path.join(DEST, 'index.html'),
        parseFileContents(data).document
      )
    )
}

function getItemPaths(item, sourceDir) {
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

function getDocumentRecords(document, dashType, dest) {
  return [
    {
      type: dashType,
      name: document.title,
      path: dest,
    },
  ].concat(
    document.anchors.map(anchor => ({
      type: anchor.type,
      name: anchor.name,
      path: dest + anchor.href,
    }))
  )
}

// meat and potatoes
function generateRecords() {
  return Promise.resolve()
    .then(() =>
      SECTIONS.map(section =>
        fsp
          .readdir(path.join(SRC, section.sourceDir))
          .then(items =>
            items
              .map(item => getItemPaths(item, section.sourceDir))
              .map(itemPath =>
                fsp
                  .readFile(path.join(SRC, itemPath.src))
                  .then(data => parseFileContents(data, section.sourceDir))
                  .then(document => {
                    if (!document) return
                    return fsp
                      .writeFile(path.join(DEST, itemPath.dest), document.html)
                      .then(() =>
                        getDocumentRecords(
                          document,
                          section.dashType,
                          itemPath.dest
                        )
                      )
                  })
              )
          )
          .then(promises => Promise.all(promises))
      )
    )
    .then(promises => Promise.all(promises))
    .then(flattenDeep)
    .then(records => records.filter(Boolean))
    .then(saveRecords)
}

function createTarball() {
  return shell.exec('tar --exclude=".DS_Store" -czf webpack.tgz webpack.docset')
}

function init() {
  return Promise.resolve()
    .then(() => fsp.mkdirs(DEST))
    .then(() => fsp.emptyDir(DEST))
    .then(writeAssets)
    .then(writeIndexFile)
    .then(generateRecords)
    .then(createTarball)
    .then(() =>
      console.log(chalk.green.bold('📦  webpack.docset & webpack.tgz built'))
    )
    .catch(err => console.error(chalk.red(err.stack)))
}

init() // 🚀
