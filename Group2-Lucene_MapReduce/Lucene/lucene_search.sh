if [ $# -eq 0 ]
  then
    echo "Please pass query, analyzerOption, and totalHitcount as arguments.
	1. The query argument is compulsory and it should be inside quatation marks.
	2. The analyzerOption is compulsory. Input \"1\" refers to standard analyzer and input \"2\" refers to english analyzer.
	3. The totalHitCount argument is optional. If not provided, it's default value is 3. 
e.g. the run command: sh lucene_search.sh \"University Riverside\" 1 5"
    exit 1
fi

if [ $# -eq 2 ] 
  then
    query=$1
    analyzerOption=$2
    totalHitCount="3"
    echo "$query and $totalHitCount"
elif [ $# -eq 3 ]
  then 
    query=$1
    analyzerOption=$2
    totalHitCount=$3
else 
  echo "Too many arguments passed! We only need three arguments - query, analyzerOption, and totalHitCount."
  exit 1
fi

javac LuceneSearch.java 
java LuceneSearch "$query" $analyzerOption $totalHitCount

