var express = require('express');
const {MongoClient} = require('mongodb');
var router = express.Router();
const fs = require('fs');
const exec = require('child_process').exec;

const URI = "mongodb://127.0.0.1:27017";
const stemedQueryFile = "output.txt";

async function stemQuery(query) {
    const childPorcess = await exec('java -jar C:\\Users\\devil\\eclipse-workspace\\invoke-jar.jar "Jar is invoked by Node js"', function(err, stdout, stderr) {
        if (err) {
            console.log(err)
        }
        console.log(stdout)
    })

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
 
    // console.log("Databases:");
    // //const db = awiat client.db('ir');

    // //db.collection("rooms").find({"users.userId":userId})
    // const stemIICollection = client.db('ir').collection('invertedIndexStem');
    // const wikipediaCollection = client.db('ir').collection('wikipedia');

    // const results = stemIICollection.find();
    // const s = await results.toArray();
    // console.log(s);

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
                //console.log(docDataList);
            }
            // element.docIdList.forEach(async(doc) => {
            //     const docData = await client.db('ir').collection('wikipedia').find({'docId': doc.docId}).toArray();
            //     docDataList = docDataList.concat(docData);
            //     console.log(docDataList);
            // })
        }
        wordToDocMap.set(curWord, docDataList);
        //fs.writeFileSync("test.json", JSON.stringify(docDataList, null, 4));
    }
    //console.log(wordToDocMap);


    return wordToDocMap;

    // const results = await client.db('ir').collection('invertedIndexStem').find({'word': 'ucr'}).toArray();

    // for (i = 0; i < results.length; i++) {
    //     results[i].docIdList.forEach(element => {
    //         console.log(element);
    //     });
    // }

    // console.log(results);
};
 

/* GET home page. */
router.get('/', async function(req, res, next) {
    let query = "ucr soccering played"
    const client = new MongoClient(URI);
    let docList = []
    let result;
    try {
        // stem the query
        await stemQuery(query);

        //connect the database
        await client.connect()

        //
        result = await getDocuments(client)
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
    res.send({"result": result});
});

module.exports = router;
