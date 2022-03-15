import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import org.apache.lucene.analysis.en.EnglishAnalyzer;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.*;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
//import org.json.simple.JSONArray;
//import org.json.simple.JSONObject;
//import org.json.simple.parser.JSONParser;
//import org.json.simple.parser.ParseException;


class LuceneNew{
    public String indexDirectoryPath;
    public LuceneNew(String indexDirectory){
        this.indexDirectoryPath=indexDirectory;
    }
    public void buildIndex(int indexedFileCount,int option) throws IOException {

        Analyzer analyzer;

	if(option==1) analyzer=new StandardAnalyzer();
        else analyzer=new EnglishAnalyzer();
        Directory indexDirectory = FSDirectory.open(new File(this.indexDirectoryPath).toPath());

        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        config.setOpenMode(IndexWriterConfig.OpenMode.CREATE);
        IndexWriter indexWriter = new IndexWriter(indexDirectory, config);
        String fileDirectoryPath = "./crawledAllText";
        File[] files = new File(fileDirectoryPath).listFiles();

        if(files!=null) {
	    int pageCount=0;
            for (File file : files) {
		String str = new String(Files.readAllBytes(Paths.get(file.getAbsolutePath())));
                String[] parts=str.split("\n");
                String body="";
                for(int i=0;i< parts.length;i++){
                    body+=parts[i]+"\n";
                }

                if(parts.length ==0)
                    continue;

                Document doc = new Document();
                doc.add(new TextField("title", parts[0], Field.Store.YES));
                doc.add(new TextField("content",  body, Field.Store.YES));
                pageCount++;
                indexWriter.addDocument(doc);
                if(pageCount>indexedFileCount) break;
            }
            System.out.println("Total Page Indexed:+"+pageCount);
            System.out.println("Index Stored At: "+ indexDirectoryPath);
	    indexWriter.close();
        }
        indexDirectory.close();
    }
}

public class LuceneIndexing{
    public static void main(String[] args) throws IOException, ParseException {
        int analyzerOption=Integer.parseInt(args[0]);
        String indexDirect="";
        if(analyzerOption==1) indexDirect+="StandardIndex";
        else indexDirect+="EnglishIndex";
        LuceneNew l=new LuceneNew(indexDirect);
	int maxNumberOfPages=14000;
        /*int indexedFileCount=1000;
        for(int i=indexedFileCount;i<=maxNumberOfPages;i+=1000){
            long currentTime=System.currentTimeMillis();
            l.buildIndex(i,analyzerOption);
            long endTime = System.currentTimeMillis();
            long execTime = endTime - currentTime;
            System.out.println("Indexed File Count: "+i+" Execution Time (sec): "+execTime/1000.0);
        }*/
        long currentTime=System.currentTimeMillis();
        l.buildIndex(14000,analyzerOption);
        long endTime = System.currentTimeMillis();
        System.out.println("Index Build Time:(sec) "+ (endTime-currentTime)/1000.0);	
    }
}
