import jwt from "jsonwebtoken";
import config from "../config/env.js";

function verifyToken(token: string): jwt.JwtPayload | null {
    return jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
}

export { verifyToken }; 