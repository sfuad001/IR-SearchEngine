import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.*;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.queryparser.classic.MultiFieldQueryParser;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.*;
import org.apache.lucene.search.similarities.*;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.analysis.en.EnglishAnalyzer;
import org.apache.lucene.index.*;

//import org.json.simple.JSONArray;
//import org.json.simple.JSONObject;
//import org.json.simple.parser.JSONParser;
//import org.json.simple.parser.ParseException;

import java.io.File;
import java.io.IOException;


class Lucene{
    public String indexDirectoryPath;
    public int topHitCount;
    public Lucene(String indexDirectory, int topHitCount){
        this.indexDirectoryPath=indexDirectory;
        this.topHitCount=topHitCount;
    }

    public void searchQuery(String queryString, int option) throws IOException, ParseException, IndexNotFoundException {
        // Now search the index:
        Analyzer analyzer;
        if(option==1) analyzer=new StandardAnalyzer();
        else analyzer=new EnglishAnalyzer();
        Directory indexDirectory = FSDirectory.open(new File(this.indexDirectoryPath).toPath());
        DirectoryReader indexReader = DirectoryReader.open(indexDirectory);
        IndexSearcher indexSearcher = new IndexSearcher(indexReader);
        Similarity[] similarityScores = {new BooleanSimilarity(), new BM25Similarity(), new LMDirichletSimilarity(), new LMJelinekMercerSimilarity((float) 0.1)};
        String[] printMetrics = {"Boolean Similarity:", "BM25 Similarity:", "LMDirichlet Similarity:", "LMJelinekMercer Similarity:"};

        String[] fields={"title","content"};
	//String[] fields={"content"};
        QueryParser parser = new MultiFieldQueryParser(fields, analyzer);
        Query query = parser.parse(queryString);

        //System.out.println(query.toString());

        TopDocs docs=indexSearcher.search(query,this.topHitCount);

        ScoreDoc[] hits = docs.scoreDocs;
        TotalHits totalHits=docs.totalHits;
        // System.out.println(totalHits);
        // Iterate through the results:
        long currentTime, endTime, execTime;
        currentTime=System.currentTimeMillis();
	System.out.println("TF-IDF score:");
        for(int rank = 0; rank < hits.length; ++rank){
            Document hitDoc = indexSearcher.doc(hits[rank].doc);

            System.out.println((rank+1)+"( score:"+hits[rank].score+")-->"+hitDoc.get("title"));
            // System.out.println(indexSearcher.explain(query, hits[rank].doc));
        }
        endTime = System.currentTimeMillis();
        execTime = endTime - currentTime;
        System.out.println("Search Time (sec): "+ execTime/1000.0);

        for(int i=similarityScores.length-1; i>=0; i--){
            indexSearcher.setSimilarity(similarityScores[i]);
            docs=indexSearcher.search(query,this.topHitCount);

            hits = docs.scoreDocs;
            totalHits=docs.totalHits;

            // Iterate through the results:
            System.out.println(printMetrics[i]);
            currentTime=System.currentTimeMillis();
            for(int rank = 0; rank < hits.length; ++rank){
                Document hitDoc = indexSearcher.doc(hits[rank].doc);

                System.out.println((rank+1)+"( score:"+hits[rank].score+")-->"+hitDoc.get("title"));

            }
            endTime = System.currentTimeMillis();
            execTime = endTime - currentTime;
            System.out.println("Search Time (ms): "+ execTime);
	
        }
        indexReader.close();
    }
}

public class LuceneSearch{
    public static void main(String[] args) throws IOException, ParseException {
	System.out.println("arguments: " + args[0] + " " + args[1] + " " + args[2]);
        int topHitCount = Integer.parseInt(args[2]);
        int option = Integer.parseInt(args[1]);
        String indexLoadPath="";
        if(option==1) indexLoadPath+="StandardIndex";
        else indexLoadPath+="EnglishIndex";
        Lucene l=new Lucene(indexLoadPath, topHitCount);
	if(option==1) System.out.println("Running Standard Analyzer Index: ");
	else System.out.println("Running English Analyzer Index: ");
	try{
            l.searchQuery(args[0],option);
        }catch (IndexNotFoundException e){
            System.out.println("Index directory: " + indexLoadPath + " Not Found");
        }
    }
}
