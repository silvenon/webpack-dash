const cheerio = require('cheerio')

const RE_METHOD = /\w+\.\w+\([^)]*\)/
const RE_FUNC = /\w+\([^)]*\)/

function getDashType (text, hasCode, context) {
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

function extractFromDoc (html, context) {
  const $ = cheerio.load(html)

  $('[href*=favicon], [href*=docsearch], [src*=docsearch]').remove()
  const cssPath = $('[rel=stylesheet]').attr('href')
  $('[rel=stylesheet]').attr('href', cssPath.substring(1))

  // in case of the index page
  if (!context) {
    $('.splash__section').last().remove()
    const content = $.html('.splash__section')
    $('body').html(content)
    $('h2').last().remove()
    $('head').append('<style>.splash__section::after { content: normal }</style>')
    return {
      document: $.html(),
    }
  }

  const content = $.html('.page__content')
  $('body').html(content)

  // remove unnecessary elements
  $('.page__edit, .icon-link, .contributors').remove()

  const anchors = $('h2, h3').map((i, el) => {
    const name = $(el).text().trim()
    const type = getDashType(name, $(el).has('code'), context) || 'Section'
    $(el).prepend(`<a name="//apple_ref/cpp/${escape(type)}/${escape(name)}" class="dashAnchor"></a>`)
    return {
      type,
      name,
      href: $(el).find('.anchor').attr('href'),
    }
  }).get().filter(anchor => anchor.href)

  const mainClone = $('.page__content').clone()
  mainClone.find('h1').remove()
  mainClone.find('blockquote').remove()

  return {
    document: $.html(),
    title: $('h1').text().trim(),
    anchors,
    isEmpty: !anchors.length && mainClone.text().trim().length < 10,
  }
}

module.exports = extractFromDoc
