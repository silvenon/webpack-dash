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
yarn
```

### Fetch webpack's documentation

The docset is being generated from the `webpack.js.org` submodule, let's initialize and update it:

```sh
git submodule update --init
```

You only have to do this once.

### Build

```sh
yarn run build
```

This generates a `webpack.js.org` build, parses that content and generates necessary stuff into `webpack.docset/Contents/Resources`.

### Update upstream

To update the webpack documentation submodule to the latest version:

```sh
yarn run update
```

Now you can rebuild the docset with the latest changes:

```sh
yarn run build
```

## License

MIT © Matija Marohnić
