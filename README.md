# Webpack Dash Docset

Documentation from [webpack.js.org](https://webpack.js.org/) parsed and annotated as a [Dash](https://kapeli.com/dash) docset. It's fast and it's offline! :zap:

## Contribute

### Install dependencies

```sh
npm install
```

### Get webpack's documentation

The docset is being generated from the `webpack.js.org` submodule, so let's set it up:

```sh
git submodule update --init # initialize and update the submodule
cd webpack.js.org
npm install # install dependencies
npm run fetch # fetch docs for loaders and plugins
npm run build # build the docs
cd .. # navigate back
```

### Build

```
npm run build
```

This parses content from `webpack.js.org` and generates necessary stuff into `webpack.docset/Contents/Resources`.

## License

MIT © Matija Marohnić
