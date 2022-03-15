#/bin/bash

read -p "Please provide analyzer option,
input \"1\" for Standard Analyzer
input \"2\" for English Analyzer: 
>>>" userInput

if [ "$userInput" != "1" ] && [ "$userInput" != "2" ] 
  then
  echo "Please provide valid option. Valid options are 1 or 2"
  exit 1
fi
echo "$userInput"

javac LuceneIndexing.java
java LuceneIndexing $userInput
