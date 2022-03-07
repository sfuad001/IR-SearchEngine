var express = require('express');
const { MongoClient } = require('mongodb');
var router = express.Router();
const fs = require('fs');
const { type } = require('os');
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
            //console.log(stdout);
            console.log("Hello")
            resolve(stdout ? stdout : stderr);
        });
    });
}

async function getDocuments(client) {
    databasesList = await client.db().admin().listDatabases();

    const queryData = fs.readFileSync(stemedQueryFile);
    const queryWords = queryData.toString().split(" ");
    console.log(queryWords);

    const wordToDocMap = new Map();
    const docToTfidfMap = new Map();
    for (i = 0; i < queryWords.length; i++) {
        const curWord = queryWords[i];
        let docDataList = [];
        // query in the invertedIndexStem collection
        // input of the query is: word
        // output of the query is the json entry of the word and it's document id list.
        // structure of the output is like this: [{ 'word': 'ucr', docIdList:[{docId: 'doc1', 'tfidf': '1'}]}]
        const invertedIndexEntries = await client.db('ir').collection('invertedIndexStem').find({ 'word': curWord }).toArray();
        //console.log(invertedIndexEntries);

        for (let i = 0; i < invertedIndexEntries.length; i++) {
            // const element = invertedIndexEntries[i];
            // query in the wikipedia collection
            // input of the query is: docId
            // output of the query is, e.g., [{'docId': 'ucr', 'body': 'jhweh', 'filename':'ucr.txt', 'url': 'https://w.com'}]

            // for (let j = 0; j < element.docIdList.length; j++) {
            //     const doc = element.docIdList[i];
            //     const docData = await client.db('ir').collection('wikipedia').find({'docId': doc.docId}).toArray();
            //     docDataList = docDataList.concat(docData);
            // }

            docDataList = docDataList.concat(invertedIndexEntries[i].docIdList);
        }

        for (let j = 0; j < docDataList.length; j++) {
            const tfIdf = docToTfidfMap.get(docDataList[j].docId);
            if (typeof tfIdf == "undefined") {
                docToTfidfMap.set(docDataList[j].docId, docDataList[j].tfIdf);
            } else {
                const newTfIdf = parseFloat(tfIdf) + parseFloat(docDataList[j].tfIdf)
                docToTfidfMap.set(docDataList[j].docId, newTfIdf);
            }
        }

        wordToDocMap.set(curWord, docDataList);
        //fs.writeFileSync("test.json", JSON.stringify(docDataList, null, 4));
    }

    // sort the docToTfifdMap by value
    const docToTfidfMapSorted = new Map([...docToTfidfMap.entries()].sort((a, b) => b[1] - a[1]));

    //console.log(wordToDocMap);
    return [wordToDocMap, docToTfidfMapSorted];
};


function cutTheArticle(docData) {
    //console.log(docData);
    //console.log(docData);
    let chunkedData = []
    for (let i = 0; i < docData.length; i++) {
        let body = docData[i].body;
        let chunkedBody = body.slice(0, Math.min(3, body.length));
        let chunkedString = "";
        let counter = 0;
        for (let j = 0; j < body.length; j++) {
            for (let k = 0; k < body[j].length; k++) {
                chunkedString += body[j][k];
                if (body[j][k] == ".") {
                    counter++;
                }
                if (counter == 2) {
                    break
                }
            }
            if (counter == 2) {
                break;
            }
        }

        console.log(chunkedBody[1].length);
        console.log(chunkedBody);
        let chunkedElement = {
            "_id": docData[i]._id,
            "docId": docData[i].docId,
            "chunkedBody": chunkedString,
            "filename": docData[i].filename,
            "url": docData[i].url,
        }
        chunkedData.push(chunkedElement);
    }
    return chunkedData;
}

async function getResultDocuments(client, docToScoreMapSorted) {
    let docDataList = [];
    let chunkedDataList = [];
    let i = 0;

    for (let [key, value] of docToScoreMapSorted) {
        // const element = invertedIndexEntries[i];
        // query in the wikipedia collection
        // input of the query is: docId
        // output of the query is, e.g., [{'docId': 'ucr', 'body': 'jhweh', 'filename':'ucr.txt', 'url': 'https://w.com'}]
        console.log(key + " = " + value);
        const docId = key;
        const docData = await client.db('ir').collection('wikipedia').find({ 'docId': docId }).toArray();
        //console.log(docData);
        const chunkedDocData = cutTheArticle(docData);
        docDataList = docDataList.concat(docData);
        chunkedDataList = chunkedDataList.concat(chunkedDocData);
        i++;
        if (i == 20) {
            break;
        }
    }
    return [docDataList, chunkedDataList];
}


/* GET home page. */
router.get('/', async function (req, res, next) {
    let query = req.query.query;
    console.log(typeof query == "undefined");

    if  (typeof query == "undefined") {
        return res.send({
            "success": false,
            "result": []
        })
    } else if (query.trim().length == "") {
        return res.send({
            "success": false,
            "result": []
        })
    }

    query = query.trim();

    console.log("req.params: check");
    console.log(req.query);
    const client = new MongoClient(URI);
    let docList = []
    let wordToDocMap;
    let docToTfidfMap;
    let docToScoreMapSorted;
    let resultDocsList;
    try {
        // stem the query
        await stemQuery(query);
        //connect the database
        await client.connect()

        // get documents for the query words
        // the output is a map <word, doc>
        const result = await getDocuments(client)
        wordToDocMap = result[0];
        docToScoreMapSorted = result[1];
        // load top 5 documents
        resultDocsList = await getResultDocuments(client, docToScoreMapSorted);
        fullbodyDocsList = resultDocsList[0];
        chunkedBodyDocsList = resultDocsList[1];

        console.log("New era of beginning");

        //console.log(docToTfidfMap);
        //console.log(docToTfidfMapSorted);
        //console.log(wordToDocMap);
        // console.log(result.get('ucr').length)
        // console.log(result.get('soccer').length)
    } catch (err) {
        console.log(err);
    }
    //client.close()
    //console.log(chunkedBodyDocsList);
    res.send({ 
        "success": true,
        "result": chunkedBodyDocsList
    });
});

module.exports = router;
