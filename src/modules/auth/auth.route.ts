import { Route } from "@core/interfaces";
import { authMiddleware } from "@core/middleware";
import validationMiddleware from "@core/middleware/validation.middleware";
import { Router } from "express";
import AuthController from "./auth.controller";

export default class AuthRoute implements Route {
    public path = '/api/auth';
    public router = Router();

    public authController = new AuthController();

    constructor() {
        this.initializeRoute();
    }

    private initializeRoute() {
        this.router.post(this.path, this.authController.login); //POST: http://localhost:5000/api/auth
        this.router.get(this.path, authMiddleware, this.authController.getCurrentLoginUser); //POST: http://localhost:5000/api/auth
    }
}