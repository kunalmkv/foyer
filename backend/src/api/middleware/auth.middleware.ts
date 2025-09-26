import _ from "lodash";
import jwt from "jsonwebtoken"

async function isLoggedIn(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    if (_.isEmpty(authHeader) || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({error: "Not logged in"});
    }

    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, process.env["JWT_SECRET"] as string);
        // @ts-ignore
        req.userAddress = payload.userAddress;
        next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({error: "Token expired"});
        }
        return res.status(403).json({error: "Invalid token"});
    }
}

export default {isLoggedIn: isLoggedIn}