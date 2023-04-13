// ####################################### 0

// ####################################### 1

import express from "express";
import cors from "cors";
import { connectToDatabase } from "./backend.js";
import { cardRouter } from "./cardRouter.js";
import { userRouter } from "./userRouter.js";

// Zwischenschritt für verallgemeinerte auszuführende methoden
const app = express();

//formatiert in json
app.use(express.json());
//fügt header ein
app.use(cors());

//Auslagerung der Router, weiterleitung an Router bei dem Path
app.use("/cards", cardRouter);
app.use("/user", userRouter);

// ruft exportierte Methode aus Backend.js auf und gibt aus, ob Datenbankverbindung erfolgreich oder nicht
connectToDatabase()
    .then(() => {
        app.listen(3000, "0.0.0.0", () => {
            console.log("Server started listening on port 3000");
        });
    })
    .catch((err) => console.log("Error starting server: ", err));