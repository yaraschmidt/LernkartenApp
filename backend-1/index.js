import express from "express";
import cors from "cors";
import { connectToDatabase } from "./backend.js";
import { cardRouter } from "./cardRouter.js";
import { userRouter } from "./userRouter.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/cards", cardRouter);
app.use("/user", userRouter);


connectToDatabase()
    .then(() => {
        app.listen(3000, "0.0.0.0", () => {
            console.log("Server started listening on port 3000");
        });
    })
    .catch((err) => console.log("Error starting server: ", err));