const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
const H = require('highland')
const spawn = require('child_process').spawn

const crfFunctions = require('./lib/crf-functions.js')

if (process.stdin.isTTY && !argv._[0]) {
  return console.error(`Usage: run-crf.js [-o file] FILE\n` +
    `-o    output file. if not given, run-crf uses stdout`)
}

// crf_test -m ./tmp/model_file ./tmp/test_file
var crfTest = spawn('crf_test', ['-m', './tmp/model_file'])
crfTest.stdin.setEncoding('utf-8')

var stream = ((argv._.length ? fs.createReadStream(argv._[0], 'utf8') : process.stdin))

H(stream)
  .split()
  .compact()
  .map(JSON.parse)
  .pick(['text'])
  .map(crfFunctions.toWords)
  .pipe(crfFunctions.splitWords)
  .pipe(crfTest.stdin)

// TODO: add IDs
H(crfTest.stdout)
  .splitBy('\n\n')
  .compact()
  .map(crfFunctions.fromCrf)
  .map(JSON.stringify)
   .compact()
  .intersperse('\n')
  .pipe(argv.o ? fs.createWriteStream(argv.o, 'utf8') : process.stdout)
