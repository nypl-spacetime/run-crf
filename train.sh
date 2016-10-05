#!/bin/bash

node train.js > ./tmp/train_file
crf_learn template_file ./tmp/train_file ./tmp/model_file
