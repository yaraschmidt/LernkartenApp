import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import environment from "dotenv";

environment.config();

const dbClient = new MongoClient( process.env.MONGODB_CONNECTION_URL );
await dbClient.connect();
const db = dbClient.db( process.env.MONGODB_DATABASE );
const userDocuments = db.collection( process.env.MONGODB_COLLECTION_USER );
const cardDocuments = db.collection( process.env.MONGODB_COLLECTION_USER_CARDS );

const app = express();
const baseUrl = "http://localhost:3000";

function processUser(user){
    if(!user) return user;
    user.links = {
        create   : { url : baseUrl, method : "POST" },
        getAll   : { url : baseUrl, method : "GET" },
        get      : { url : baseUrl + "/" + user._id,                              method : "GET" },
        update   : { url : baseUrl + "/" + user._id,                              method : "PUT" },
        delete   : { url : baseUrl + "/" + user._id,                              method : "DELETE" },
        nextCard : { url : "http://localhost:3000/cards/nextForUser/" + user._id, method : "GET" },
    }
    return user;
}

function processCard(card){
    if(!card)
        return { links :{
                create : { url : baseUrl, method : "POST" },
                getAll : { url : baseUrl, method : "GET" }
            }
        }
    card.links = {
        create : { url : baseUrl,                   method : "POST" },
        getAll : { url : baseUrl,                   method : "GET" },
        solve  : { url : baseUrl + "/solve",        method : "POST" },
        get    : { url : baseUrl + "/" + card._id,  method : "GET" },
        update : { url : baseUrl + "/" + card._id,  method : "PUT" },
        delete : { url : baseUrl + "/" + card._id,  method : "DELETE" },
    }
    return card
}

app.use(express.json());
app.use(cors());

app.get("/user", async function(_, res){
    const arr = await userDocuments.find({}).toArray()
    res.json(arr.map(processUser))
});

app.get("/user/:id", async function(req, res) {
    const {id,} = req.params;
    if(!id) return res.sendStatus(400);

    const user = await userDocuments.findOne({_id : new ObjectId(id)});
    res.json(processUser(user));
});

app.post("/user", async function(req, res){
    const {name, age, color} = req.body;
    if(!name || !age || !color) return res.sendStatus(400);
    const user = {
        name : name,
        age : age,
        color : color
    }
    const response = await userDocuments.insertOne(user);
    user._id = response.insertedId;
    res.json(processUser(user));
});

app.put("/user", async function(req, res) {
    const {_id, name, age, color} = req.body;
    if(!_id || !name || !age || !color) return res.sendStatus(400);
    const user = {
        _id : new ObjectId(_id),
        name : name,
        age : age,
        color : color
    }
    const response = await userDocuments.updateOne({_id :  user._id}, {$set : user});
    res.json(processUser(user));
});

app.delete("/user/:id", async function(req, res) {
    const {id,} = req.params;
    if(!id) return res.sendStatus(400);
    const response = await userDocuments.deleteOne({_id : new ObjectId(id)});
    if(response.acknowledged && response.deletedCount == 1){
        res.sendStatus(200);
    }else{
        res.sendStatus(404);
    }
});

app.get("/cards", async function(_, res) {
    const arr = await cardDocuments.find({}).toArray();
    res.json(arr.map(processUser));
});

app.get("/cards/:id", async function(req, res) {
    const {id, } = req.params;
    if(id == undefined) return res.sendStatus(400);
    const card = await cardDocuments.findOne({_id : new ObjectId(id)});
    res.json(processCard(card));
})

app.post("/cards", async function(req, res) {
    const {question, answer, color} = req.body;
    if( question == undefined || answer == undefined || color == undefined) return res.sendStatus(404);
    const card = {
        question : question,
        answer : answer,
        color : color,
        user : []
    }
    const response = await cardDocuments.insertOne(card);
    card._id = response.insertedId;
    res.json(processCard(card));
});

app.post("/cards/solve", async function(req, res) {
    const {cardId, userId, answerKind} = req.body;
    if(cardId == undefined || userId == undefined) return res.sendStatus(400);
    const user = await userDocuments.findOne({_id : new ObjectId(userId)});
    if(!user) return res.sendStatus(403);
    await cardDocuments.updateOne({_id : new ObjectId(cardId)}, {$push : {"user" : { userId : user._id, kind : answerKind }}})
    res.sendStatus(200);
});

app.get("/cards/nextForUser/:id", async function(req, res) {
    const { id } = req.params;
    if(id == undefined ) return res.sendStatus(400);
    const card = await cardDocuments.findOne({
        $or : [
            { user : { $all : [ { "$elemMatch" : { userId : { $ne : new ObjectId(id) } } } ]} },
            { user : { $eq : [] } }
        ]
    });
    res.json(processCard(card));
});

app.put("/cards", async function(req, res) {
    const { _id, question, answer, color } = req.body;
    if(_id == undefined || question == undefined || answer == undefined || color == undefined ) return res.sendStatus(400);
    const card = {
        _id : new ObjectId(_id),
        question : question,
        answer : answer,
        color : color
    }
    const response = await cardDocuments.updateOne({_id : card._id}, {$set : card});
    if(response.acknowledged && response.modifiedCount == 1){
        res.json(processCard(card))
    }else{
        res.json()
    }
});

app.delete("/cards/:id", async function(req, res) {
    const { id } = req.params;
    if(id == undefined) return res.sendStatus(400);
    const response = await cardDocuments.deleteOne({_id : new ObjectId(id)});
    if(response.acknowledged && response.deletedCount == 1){
        res.sendStatus(200);
    }else{
        res.sendStatus(403);
    }
});

app.listen(3000, "0.0.0.0", function() {
    console.log("Server gestartet!");
});