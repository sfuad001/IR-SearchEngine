if [ $# -ne 4 ]
  then
    echo "Please pass seed_path, max_depth, max_page_count, and output_dir_path as arguments."
    exit 1
fi


javac CrawlerWithImage.java 
java CrawlerWithImage $1 $2 $3 $4

