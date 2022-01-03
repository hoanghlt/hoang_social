import { Route } from "core/interfaces";
import express, { Router } from "express";
import mongoose from "mongoose";

class App{
    public app = express.application;
    public port: string | number;

    constructor(routes: Route[]){
        this.app = express();
        this.port = process.env.PORT || 5000;

        this.initializeRoutes(routes);
        this.connectToDatabase();
    }

    public listen(){
        this.app.listen(this.port, () => {
            console.log(`Server is listening on port ${this.port}`);
        });
    }

    private initializeRoutes(routes: Route[]) {
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });
    }    

    private connectToDatabase() {        
        try {
            const connectionString = 'mongodb+srv://hoang:hoang2153@master.kv3c5.mongodb.net/SocialNetwork?retryWrites=true&w=majority';
            mongoose.connect(connectionString);
            console.log('Database connected...');
        } catch (error) {
            console.log('Connect to database error!');
        }
    }
}

export default App;