const H = require('highland')
const request = require('request')
const config = require('./config.json')

const crfFunctions = require('./lib/crf-functions.js')

const submissionsUrl = `${config.apiUrl}tasks/${config.taskId}/submissions/all.ndjson`

H(request(submissionsUrl))
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
