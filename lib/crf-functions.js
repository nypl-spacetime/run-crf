const H = require('highland')
const R = require('ramda')

const OTHER_FIELD = 'other'

const makeLabels = {
  cap: (word) => word[0].toUpperCase() === word[0],
  abbr: (word) => word.endsWith('.'),
  num: (word) => /\d/.test(word)
}

const toCrfLabel = (field, first) => {
  if (!field) {
    return null
  }

  var label = field.toUpperCase()
  if (field !== OTHER_FIELD) {
    label = `${first ? 'I-' : 'B-'}${label}`
  }
  return label
}

const labelToField = (label) => {
  const field = label.toLowerCase()
  if (field === OTHER_FIELD) {
    return field
  } else {
    return field.substring(2)
  }
}

const findFields = (row) => {
  const fields = R.toPairs(row.fields)
    .filter((kv) => kv[1])
    .sort((a, b) => a[1].from - b[1].from)
    .map((kv) => Object.assign(kv[1], {
      field: kv[0]
    }))

  var currentPos = 0
  var lines = fields
    .map((field, index) => {
      const last = (index === fields.length - 1)
      var lines = []
      if (field.from > currentPos) {
        lines.push({
          text: row.input.substring(currentPos, field.from),
          field: OTHER_FIELD
        })
      }

      lines.push({
        text: row.input.substring(field.from, field.to + 1),
        field: field.field
      })
      currentPos = field.to + 1

      if (last && currentPos < row.input.length) {
        lines.push({
          text: row.input.substring(currentPos, row.input.length),
          field: OTHER_FIELD
        })
      }

      return lines
    })

  return R.flatten(lines).map(toWords)
}

const toWords = (line) => line.text
  .split(' ')
  .filter((word) => word.length)
  .map((word, i) => ({
    text: word,
    field: toCrfLabel(line.field, i === 0)
  }))

const toLine = (word) => {
  if (word.text) {
    const labels = R.toPairs(makeLabels)
      .map((kv) => (kv[1](word.text) ? 'Yes' : 'No') + kv[0].toUpperCase())

    return [
      word.text,
      `I${word.index + 1}`,
      ...labels,
      word.field
    ].filter(R.identity).join('\t')
  } else {
    return ''
  }
}

const addLineIndex = (lines) => R.flatten(lines)
  .map((l, i) => Object.assign(l, {index: i}))

const splitWords = H.pipeline(
  H.map(addLineIndex),
  H.intersperse('\n'),
  H.flatten(),
  H.map(toLine),
  H.intersperse('\n'),
  H.append('\n')
)

const fromCrf = (lines) => {
  const words = lines.split('\n').map((line) => line.split(('\t')))
  const text = words.map((word) => word[0]).join(' ')

  var fields = {}
  words.forEach((word) => {
    const label = word[word.length - 1]
    const field = labelToField(label)

    if (field !== OTHER_FIELD) {
      if (!fields[field]) {
        fields[field] = word[0]
      } else {
        fields[field] += ' ' + word[0]
      }
    }
  })

  return {
    text,
    fields
  }
}

module.exports = {
  findFields,
  toWords,
  splitWords,
  fromCrf
}
