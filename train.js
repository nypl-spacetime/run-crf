const H = require('highland')
const request = require('request')

const crfFunctions = require('./lib/crf-functions.js')

// const URL = 'http://surveyor-api.dev/tasks/label-fields/submissions/all.ndjson'
const URL = 'http://localhost:55789/tasks/label-fields/submissions/all.ndjson'

H(request(URL))
  .split()
  .compact()
  .map(JSON.parse)
  .map((submission) => ({
    input: submission.item.data.text.trim(),
    fields: submission.data
  }))
  .map(crfFunctions.findFields)
  .pipe(crfFunctions.splitWords)
  .pipe(process.stdout)
