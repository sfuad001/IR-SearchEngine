**Part A of the project**

**The lucene indexing part is here : https://github.com/jannatmeem95/IR_Project-SearchEngine.git**



# IR-SearchEngine

**Crawler and HDFS:**
We have three bash scripts named crawler.sh, lucene_indexing.sh, and lucene_search.sh. Their functionalities are discussed below:

crawler.sh: This script starts crawling the web pages. It takes four command line arguments. The arguments are seed_path, max_depth, max_page_count and output_dir_path. For example, the command to run this script is:
	sh crawler.sh https://en.wikipedia.org/wiki/Novel 4 100000 output
	
lucene_indexing.sh: It generates the index files from the given documents. It asks the user input for analyzer options. We are working with two types of analyzers, one is standard analyzer and another one is english analyzer. The command to run this script is:
	sh lucene_indexing.sh
	
lucene_search.sh: This script outputs top k results of the given query using the indexed files. It takes the query, analyzer_option and totalHitCount (k) as arguments. One example to run this script is given below:
	sh lucene_search.sh "UC Education System" 2 5
	
**Web Interface**
In order to start the web interface, follow the guidelines given below:

mongodb: 
1. Install mongodb. 
2. Then run dataInsertMongoDb.py script using python3 to insert wikipedia pages into the mongodb database "ir". The collection name is "wikipedia". 
3. Before running these script, put your own source directory path of wikipedia pages inside the script. 
4. In order to insert the inverted index, run script named insertInvertedIndexStem.py and insertInvertedIndexRaw.py.

node server: 
1.First install nodejs in your machine. 
2.Then go to IR-SearchEngine/backend/ and run the command npm install. 
3. After that run npm start. The node server will start listening.

react app: 
1.Go to IR-SearchEngine/react-app/ and run npm install. 
2.Then run npm start. You can now access the search engine web interface in http://localhost.com:3000.
