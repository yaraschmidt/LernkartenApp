import express from "express";
import { ObjectId } from "mongodb";
import { collections } from "./backend.js";

const baseUrl = "http://localhost:3000/cards"

function insertHateoasLinks(card){
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


export const cardRouter = express.Router();

cardRouter.get("/", async (req, res) => {
    collections.cardCollection.find({}).toArray()
        .then(arr => res.json(
            arr.map(card => insertHateoasLinks(card))
        ))
});

cardRouter.get("/:id", async (req, res) => {
    const {id} = req.params;
    console.log(id);
    if(!id) return res.sendStatus(404);
    collections.cardCollection.findOne({"_id" : new ObjectId(id)})
        .then(val => res.json(insertHateoasLinks(val)));
});

cardRouter.post("/solve", async (req, res) => {
    const { cardId, userId, kind } = req.body;
    if(!cardId || !userId) return res.sendStatus(400);
    collections.userCollection.findOne({_id : new ObjectId(userId)})
        .then(val => {
            if(!val) return res.sendStatus(401);
            collections.cardCollection.updateOne({_id : new ObjectId(cardId)}, {$push : {"user" : { userId : new ObjectId(userId), kind : kind }}})
                .then(val => res.sendStatus( (val.acknowledged) ? 200 : 402 ));
        });
});

cardRouter.get("/nextForUser/:id", (req, res) => {
    const { id } = req.params;
    if(!id) return res.sendStatus(400);
    collections.cardCollection.findOne({
        $or : [
            { user : { $eq : [] } },
            { user : 
                { $not : {
                    "$elemMatch" : {
                        userId : oid ,
                        kind : 'solved'
                    }
            } } }
        ]
    }).then(val => res.json(insertHateoasLinks(val)));
});

cardRouter.post("/", async (req, res) => {
    const {question, answer, color} = req.body;
    if(!question || !answer || !color) return res.sendStatus(404);
    collections.cardCollection.insertOne({
            question: question,
            answer  : answer,
            color   : color,
            user   : []
    }).then(val => res.json(insertHateoasLinks({
        _id : val.insertedId,
        question: question,
        answer  : answer,
        color   : color
    })));
});

cardRouter.put("/", async (req, res) => {
    const {_id, question, answer, color} = req.body;
    if(!_id || !question || !answer ) return res.sendStatus(404);
    collections.cardCollection.updateOne({_id : new ObjectId(_id)},{$set : {
        question: question,
        answer  : answer,
        color : color || "#ffffff"
    }}).then(val => (!val.acknowledged) ? res.sendStatus(400) : res.json(insertHateoasLinks({
        _id : _id,
        question: question,
        answer  : answer,
        color: color || "#ffffff"
    })));
});

cardRouter.delete("/:id", async (req, res) => {
    const {id} = req.params;
    if(!id) return res.sendStatus(400);
    collections.cardCollection.deleteOne({_id : new ObjectId(id)})
        .then(val => res.sendStatus( (val.deletedCount == 1) ? 200 : 401 ));
});