var express = require('express');
const {MongoClient} = require('mongodb');
var router = express.Router();
const fs = require('fs');

const URI = "mongodb://127.0.0.1:27017";
const stemedQueryFile = "output.txt";

async function listDatabases(client){
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
    const words = queryData.toString().split(" ");
    console.log(words);

    for (i = 0; i < words.length; i++) {
        console.log(words[i]);
    }

    const results = await client.db('ir').collection('invertedIndexStem').find({'word': 'ucr'}).toArray();

    for (i = 0; i < results.length; i++) {
        results[i].docIdList.forEach(element => {
            console.log(element);
        });
    }

    console.log(results);
};
 

/* GET home page. */
router.get('/', async function(req, res, next) {
    const client = new MongoClient(URI);
    docList = []
    try {
        await client.connect()
        await listDatabases(client)

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
    output = {
        docList: docList
    }
    res.send(output)
});

module.exports = router;
