const fs = require('fs')
const H = require('highland')
const spawn = require('child_process').spawn

const crfFunctions = require('./lib/crf-functions.js')

// crf_test -m ./tmp/model_file ./tmp/test_file
var crfTest = spawn('crf_test', ['-m', './tmp/model_file'])
crfTest.stdin.setEncoding('utf-8')

// TODO: grijp van stdin of argv._

H(fs.createReadStream('/Users/bertspaan/data/city-directories/1849/lines.ndjson'))
  .split()
  .compact()
  .map(JSON.parse)
  .pick(['text'])
  .map(crfFunctions.toWords)
  .pipe(crfFunctions.splitWords)
  .pipe(crfTest.stdin)

H(crfTest.stdout)
  .splitBy('\n\n')
  .compact()
  .map(crfFunctions.fromCrf)
  // .pipe(process.stdout)
  .each((line) => {
    console.log(line)
  })
