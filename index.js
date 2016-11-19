const path = require('path')
const fsp = require('fs-promise')
const shell = require('shelljs')
const extractFromDoc = require('./html')
const saveRecords = require('./database')

const SRC = path.join(__dirname, 'webpack.js.org', 'build')
const DEST = path.join(__dirname, 'webpack.docset', 'Contents', 'Resources', 'Documents')
const SECTIONS = [
  { sourceDir: 'api', dashType: 'Guide' },
  { sourceDir: 'concepts', dashType: 'Guide' },
  { sourceDir: 'configuration', dashType: 'Guide' },
  { sourceDir: 'get-started', dashType: 'Guide' },
  { sourceDir: 'guides', dashType: 'Guide' },
  { sourceDir: 'loaders', dashType: 'Module' },
  { sourceDir: 'plugins', dashType: 'Plugin' },
]

function getItemRecords (item, sourceDir, dashType) {
  let sourcePath, destPath

  if (item === 'index.html') {
    sourcePath = path.join(sourceDir, item)
    destPath = `${sourceDir}.html`
  } else {
    sourcePath = path.join(sourceDir, item, 'index.html')
    destPath = `${sourceDir}-${path.basename(item)}.html`
  }

  return fsp.readFile(path.join(SRC, sourcePath)).then(content => {
    const { document, title, anchors, isEmpty } = extractFromDoc(content.toString(), sourceDir)
    return fsp.writeFile(path.join(DEST, destPath), document).then(() => {
      return [{
        type: dashType,
        name: title,
        path: destPath,
        isEmpty,
      }].concat(anchors.map(anchor => ({
        type: anchor.type,
        name: anchor.name,
        path: destPath + anchor.href,
      })))
    })
  })
}

fsp.mkdirs(DEST)
  .then(() => fsp.emptyDir(DEST))
  .then(() => shell.cp('-r', path.join(SRC, '*.css'), DEST))
  .then(() => shell.cp(path.join(SRC, 'assets', 'favicon.ico'), DEST))
  .then(() => {
    return fsp.readFile(path.join(SRC, 'index.html')).then(content => {
      const { document } = extractFromDoc(content.toString())
      return fsp.writeFile(path.join(DEST, 'index.html'), document)
    })
  })
  .then(() => SECTIONS.map(({ sourceDir, dashType }) => {
    return fsp.readdir(path.join(SRC, sourceDir)).then(items => {
      return Promise.all(items.map(item => {
        return getItemRecords(item, sourceDir, dashType)
      }))
    })
  }))
  .then(promises => Promise.all(promises))
  .then(records => {
    const flattenedRecords = records
      .reduce((p, c) => p.concat(c), [])
      .reduce((p, c) => p.concat(c), [])
      .filter(record => !record.isEmpty) // reject empty pages
    return saveRecords(flattenedRecords)
  })
  .then(() => {
    shell.exec('tar --exclude=".DS_Store" -cvzf webpack.tgz webpack.docset')
    console.log('webpack.tgz built')
  })
  .catch(err => {
    console.error(err.stack)
  })
