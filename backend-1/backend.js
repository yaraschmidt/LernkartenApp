import { MongoClient } from "mongodb";
import dotenv from "dotenv";


export const collections = {
    cardCollection     : {},
    userCollection      : {}
}

export async function connectToDatabase(){
    dotenv.config();

    const client = new MongoClient(process.env.MONGODB_CONNECTION_URL);

    await client.connect();

    const db = client.db(process.env.MONGODB_DATABASE);

    collections.cardCollection = db.collection(process.env.MONGODB_COLLECTION_CARD);
    collections.userCollection = db.collection(process.env.MONGODB_COLLECTION_USER);
    console.log("Successfully connected to Colextions: ", collections.cardCollection.collectionName, collections.userCollection.collectionName);
}