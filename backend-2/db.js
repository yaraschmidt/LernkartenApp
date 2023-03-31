// ####################################### 2

import { MongoClient } from "mongodb";
import dotenv from "dotenv";

export async function connect(){
    dotenv.config();
    const client = new MongoClient(process.env.MONGODB_CONNECTION_URL);
    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const user = db.collection(process.env.MONGODB_COLLECTION_USER);
    const cards = db.collection(process.env.MONGODB_COLLECTION_USER_CARDS);
    console.log("Verbunden zu", user.collectionName, cards.collectionName);
    return [user, cards];
}