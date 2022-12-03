const app = require("./app");
require("dotenv").config();
const connectDB = require("./db/connect");

const PORT = 8800;
const SERVER = process.env.SERVER_NAME.replace("<password>",process.env.SERVER_PASSWORD);

const start = async () => {
    try {
        await connectDB(SERVER);
        console.log("DATABASE connection successfuly made...");
        app.listen(PORT,()=>{
            console.log("Server has just started sucessfuly...")
        })
    }catch(err) {
        console.log(err);
    }
}

start();