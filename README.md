# run-crf

First, install CRF++:

    brew install crf++

Then, install dependencies:

    npm install
    
Make a directory which will hold training data:

    mkdir tmp

Then, train the CRF model using submissions from our [Label Fields](https://github.com/nypl-spacetime/label-fields) tool:

    ./train-crf.sh

Now, run the CRF process on OCR output from our [OCR script](github.com/nypl-spacetime/ocr-scripts):

    cat /path/to/city-directory/lines.ndjson | node run-crf.js
    
To save this data to file, use the `-o` options, or pipe the output to a file on your disk:

    cat /path/to/city-directory/lines.ndjson | node run-crf.js > ./tmp/crf-results.ndjson

Using sed and [jq](https://stedolan.github.io/jq/), we can output all the professions, sorted:

    cat ./tmp/crf-results.ndjson | jq -r '. | .fields.profession' | sed 's/,$//g' | sort | uniq -c | sort

## See also

- https://github.com/NYTimes/ingredient-phrase-tagger
- https://taku910.github.io/crfpp/
- http://open.blogs.nytimes.com/2015/04/09/extracting-structured-data-from-recipes-using-conditional-random-fields/
- http://open.blogs.nytimes.com/2016/04/27/structured-ingredients-data-tagging/
