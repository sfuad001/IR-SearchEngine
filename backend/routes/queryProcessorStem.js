var express = require('express');
const {MongoClient} = require('mongodb');
var router = express.Router();
const fs = require('fs');
const exec = require('child_process').exec;

const URI = "mongodb://127.0.0.1:27017";
const stemedQueryFile = "output.txt";

async function stemQuery(query) {
    const outputFilePath = "output.txt";
    const cmd = `java -jar TestIR-1.0-SNAPSHOT-jar-with-dependencies.jar "${query}" "${outputFilePath}"`;

    return new Promise((resolve, reject) => {
     exec(cmd, (error, stdout, stderr) => {
      if (error) {
       console.warn(error);
      }
      console.log(stdout);
      console.log("Hello")
      resolve(stdout? stdout : stderr);
     });
    });
}

async function getDocuments(client){
    databasesList = await client.db().admin().listDatabases();

    const queryData = fs.readFileSync(stemedQueryFile);
    const queryWords = queryData.toString().split(" ");
    console.log(queryWords);

    const wordToDocMap = new Map();
    for (i = 0; i < queryWords.length; i++) {
        const curWord = queryWords[i];
        let docDataList = [];
        // query in the invertedIndexStem collection
        // input of the query is: word
        // output of the query is the json entry of the word and it's document id list.
        // structure of the output is like this: [{ 'word': 'ucr', docIdList:[{docId: 'doc1', 'tfidf': '1'}]}]
        const invertedIndexEntries = await client.db('ir').collection('invertedIndexStem').find({'word': curWord}).toArray();
        console.log(invertedIndexEntries);

        for (let i = 0; i < invertedIndexEntries.length; i++) {
            const element = invertedIndexEntries[i];
            // query in the wikipedia collection
            // input of the query is: docId
            // output of the query is, e.g., [{'docId': 'ucr', 'body': 'jhweh', 'filename':'ucr.txt', 'url': 'https://w.com'}]

            for (let j = 0; j < element.docIdList.length; j++) {
                const doc = element.docIdList[i];
                const docData = await client.db('ir').collection('wikipedia').find({'docId': doc.docId}).toArray();
                docDataList = docDataList.concat(docData);
            }
        }
        wordToDocMap.set(curWord, docDataList);
        //fs.writeFileSync("test.json", JSON.stringify(docDataList, null, 4));
    }

    //console.log(wordToDocMap);
    return wordToDocMap;
};
 

/* GET home page. */
router.get('/', async function(req, res, next) {
    let query = "ucr soccering played"
    const client = new MongoClient(URI);
    let docList = []
    let wordToDocMap;
    try {
        // stem the query
        await stemQuery(query);
        //connect the database
        await client.connect()

        // get documents for the query words
        // the output is a map <word, doc>
        wordToDocMap = await getDocuments(client)
        // console.log(result);
        // console.log(result.get('ucr').length)
        // console.log(result.get('soccer').length)
    } catch(err) {
        console.log(err);
    }
    //client.close()

    docList = [
        {
            title: "Hello world",
            description: "Hello world is the first printf operation that most of the people write as their first code"
        },
        {
            title: "Wikipedia",
            description: "psychometry"
        }
    ]
    const output = {
        docList: docList
    }
    res.send({"result": wordToDocMap});
});

module.exports = router;
