const cheerio = require('cheerio')

const RE_METHOD = /\w+\.\w+\([^)]*\)/
const RE_FUNC = /\w+\([^)]*\)/

function getDashType(text, hasCode, context) {
  if (hasCode) {
    switch (context) {
      case 'api':
        if (RE_METHOD.test(text)) return 'Method'
        if (RE_FUNC.test(text)) return 'Function'
        break
      case 'configuration':
        return 'Option'
    }
  }
}

function parseFileContents(data, context) {
  const $ = cheerio.load(data.toString())

  // some pages contain no content, they just redirect to another page,
  // in that case mark the page as empty and don't save the record
  if ($('[http-equiv="refresh"]').length > 0) return false

  $(
    '[href*=favicon], [href*=docsearch], [src*=docsearch], [href*="fonts.googleapis.com"], [name=theme-color]',
  ).remove()
  const cssPath = $('[rel=stylesheet]').attr('href')
  // Dash can't do absolute paths
  $('[rel=stylesheet]').attr('href', cssPath.slice(1))

  // in case of the index page
  if (!context) {
    $('.splash__section')
      .last()
      .remove()
    const content = $.html('.splash__section')
    $('body').html(content)
    $('h2')
      .last()
      .remove()
    $('head').append(
      '<style>.splash__section::after { content: normal }</style>',
    )
    return {
      document: $.html(),
    }
  }

  $('body').html($('.page__content'))

  // remove unnecessary elements
  const pageEdit = $('.page__edit')
  pageEdit.add(pageEdit.next().nextAll()).remove()

  // remove Gitter
  $('[class*=gitter]').remove()

  // remove "edit document" links
  $('.page-links').remove()

  // remove contributors
  $('.contributors')
    .parent()
    .remove()

  const anchors = $('h2, h3')
    .map((i, el) => {
      const name = $(el)
        .text()
        .trim()
      const type = getDashType(name, $(el).has('code'), context) || 'Section'
      $(el).prepend(
        `<a name="//apple_ref/cpp/${escape(type)}/${escape(
          name,
        )}" class="dashAnchor"></a>`,
      )
      return {
        type,
        name,
        href: $(el)
          .find('.anchor')
          .attr('href'),
      }
    })
    .get()
    .filter(anchor => anchor.href)

  const mainClone = $('.page__content').clone()
  mainClone.find('h1').remove()
  mainClone.find('blockquote').remove()

  // in case there's is (almost) no content, ignore the document
  if (anchors.length === 0 && mainClone.text().trim().length < 10) return

  return {
    html: $.html(),
    title: $('h1')
      .text()
      .trim(),
    anchors,
    context,
  }
}

module.exports = parseFileContents
