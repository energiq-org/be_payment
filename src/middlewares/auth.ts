import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/token.js";
import { validateTypeboxSchema } from "../utils/validation.js";
import { Static } from "@sinclair/typebox";
import { accessTokenPayloadSchema } from "../schemas/auth.js";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = (req.headers["authorization"] as string)?.split(" ")[1];
    if (token === undefined) {
        return res.status(401).json({ error: "Authorization token required" });
    }

    let tokenPayload: Static<typeof accessTokenPayloadSchema>;
    try {
        tokenPayload = verifyToken(token) as Static<typeof accessTokenPayloadSchema>;
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { isValid, message } = validateTypeboxSchema(tokenPayload, accessTokenPayloadSchema);
    
    if (!isValid) {
        return res.status(401).json({ error: "Invalid token format" });
    }

    req["userId"] = tokenPayload.id;
    next();
}

export { authMiddleware }; 