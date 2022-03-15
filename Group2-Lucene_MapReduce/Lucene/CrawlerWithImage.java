import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashSet;
import java.io.*;
import java.net.URL;

public class CrawlerWithImage {
    private static int MAX_DEPTH;
    private HashSet<String> links;
    int fileCount;
    static File outputDirectory;

    public CrawlerWithImage(int maxDepth, int maxPage, String outdir) {
        links = new HashSet<>();
        MAX_DEPTH = maxDepth;
        fileCount = maxPage;

        outputDirectory = new File(outdir);
        if (!outputDirectory.exists()){
            outputDirectory.mkdirs();
        }
    }


    public void writeToFile(String filename, String title, Elements paragraphs) {

        try {
            FileWriter writer = new FileWriter(filename);

            writer.write(title);
            writer.write("\n");
            for (Element p : paragraphs) {
                writer.write(p.text());
                writer.write("\n");
            }

            writer.close();
        } catch (IOException e) {
            System.err.println(e.getMessage());
        }
    }
    private static void downloadImage(String strImageURL, String title, int imageCounter) {
        String strImageName =
                strImageURL.substring(strImageURL.lastIndexOf("/") + 1);
        if((strImageName.contains(".jpg") || !strImageName.contains(".svg.png")) && !strImageName.contains("type=")){

            try {
                URL urlImage = new URL(strImageURL);

                InputStream in = urlImage.openStream();

                byte[] buffer = new byte[4096];
                int n = -1;

                OutputStream os =
                        new FileOutputStream( outputDirectory +"/" + title.replace('/','a') + "_" + imageCounter + "-4321-" + strImageName);

                while ((n = in.read(buffer)) != -1) {
                    os.write(buffer, 0, n);
                }

                os.close();

            } catch (IOException e) {
                e.printStackTrace();
            }
        }

    }

    public void getPageLinks(String URL, int depth) {
        try {
            final Connection.Response response = Jsoup.connect(URL).execute();
            final Document doc = response.parse();
            String title = doc.title();

            if ((!links.contains(title) && (depth <= MAX_DEPTH))) {
                links.add(title);
                System.out.println(depth);
                Elements paragraphs = doc.select("p");
                if (fileCount > 100000) {
                    return;
                }
                writeToFile( outputDirectory  +"/" + title + ".txt", title, paragraphs);

                Elements imageElements = doc.select("img");

                int imageCounter = 1;
                //iterate over each image
                for (Element imageElement : imageElements) {
                    String strImageURL = imageElement.attr("abs:src");

                    downloadImage(strImageURL, title, imageCounter);
                    imageCounter++;
                }

                fileCount++;

                Elements linksOnPage =doc.select("p a[href^=\"/wiki\"]");
                depth++;
                for (Element page : linksOnPage) {
                    getPageLinks(page.attr("abs:href"), depth);
                }

            }
        } catch (Exception e) {
            //System.err.println("For '" + URL + "': " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        //args[0], Integer.parseInt(args[1]), Integer.parseInt(args[2]), args[3]
        //String seed, int maxDepth, int maxPage, String outdir
        new CrawlerWithImage(Integer.parseInt(args[1]), Integer.parseInt(args[2]), args[3]).getPageLinks(args[0], 1);
    }
}
