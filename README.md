# Webpack Dash Docset

Documentation from [webpack.js.org](https://webpack.js.org/) parsed and annotated as a [Dash](https://kapeli.com/dash) docset. It's fast and it's offline! :zap:

## Where do I find this docset?

In Dash go to Preferences › Downloads › User Contributed.

If you notice that the docset in Dash got outdated, feel free to send a PR to [Kapeli/Dash-User-Contributions](https://github.com/Kapeli/Dash-User-Contributions) using the docset you generate here.

## Development

The script does its best to clean up the HTML, exclude empty records etc. If you notice a problem, please contribute!

Make sure you have [Yarn](http://yarnpkg.com/) installed.

### Install dependencies

```sh
yarn install
```

### Build the docset

```sh
yarn build
```

This shallowly clones the prebuilt `gh-pages` branch from the webpack.js.org repo, parses that content and generates necessary stuff into `webpack.docset/Contents/Resources`.

## License

MIT © Matija Marohnić
