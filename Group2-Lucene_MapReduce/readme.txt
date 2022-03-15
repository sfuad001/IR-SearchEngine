**Lucene Indexing**

We have three bash scripts named crawler.sh, lucene_indexing.sh, and lucene_search.sh. Their functionalities are discussed below:

First, to run them go to the directory named "data". From inside "data" the following scripts can be run:

crawler.sh:
This script starts crawling the webpages. It takes four commandline arguments. The arguments are seed_path, max_depth, max_page_count, and, output_dir_path. For example, the command to run this script is:
	
	sh crawler.sh https://en.wikipedia.org/wiki/Novel 4 100000 output

lucene_indexing.sh:
It generates the index files from the given documents. It asks the user input for analyzer options. We are working with two types of analyzers; one is standard analyzer and another one is english analyzer. The command to run this script is:

	sh lucene_indexing.sh

lucene_search.sh:
This script outputs top-k results of the given query using the indexed files. It takes the query, analyzer_option and totalHitCount (k) as arguments. One example to run this script is given below:

	sh lucene_search.sh "UC Education System" 2 5

WordCount directory contains our implementation for MapReduce based tf-idf calculation for generating the inverted index files.

**Hadoop Indexing**

We created a jar file named "tfidfwithstemming.jar" and ran it on the bolt machine using the following command: 

java -jar tfidfwithstemming.jar input output

[input directory is the data/crawledAllText/ directory in out bolt machine where all crawled data is stored.
