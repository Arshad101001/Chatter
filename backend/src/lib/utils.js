import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {

    const { JWT_SECRET } = process.env;
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not configured");

    const token = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // MS
        httpOnly: true,     // prevents XSS attacks: cross-site scripting
        sameSite: "strict", // prevents CSRF attack
        secure: process.env.NODE_ENV === "development" ? false : true,      // if your in development http request will be accepted and if not then https required
    });

    return token;
}