#!/bin/bash

node train-crf.js > ./tmp/train_file
crf_learn template_file ./tmp/train_file ./tmp/model_file
