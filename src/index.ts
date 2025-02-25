import express, { Express, NextFunction, Request, Response } from "express"
import session from "express-session"

const app: Express = express()

// data
import * as users from "./users.json"
import * as sessions from "./sessions.json"
import * as data from "./data.json"

// types
interface IData {
    id: number,
    data: string,
    public: boolean
}

interface ISession {
    sessionId: string,
    userId: number
}

interface IUser {
    userId: string,
    username: string,
    password: string
}

// middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(session({
    secret: 'sessionsecret',
    resave: false,
    saveUninitialized: true, // generate a new session id every time
    cookie: {
        secure: false,
        maxAge: 60 // expire time of cookie in ms
    }
}))

function validateCookie(cookie: string): boolean {
    if (cookie in sessions) {
        return true
    }
    return false
}

function authenticate(req: Request, res: Response, next: NextFunction) {
    const cookie = req.headers.cookie?.split("=")[1]
    console.log("cookie received:", cookie)
    if (!cookie || !validateCookie(cookie)) {
        res.status(401).json({
            message: "invalid user"
        })
        return
    }
    next()
}

// routes
app.post("/login", (req: Request, res: Response) => {
    res.cookie("mycookie", req.sessionID)
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({
            message: "username or password not provided"
        })
        return
    }

    res.status(200).json({
        message: "login success"
    })
})

app.get("/:id", authenticate, (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id || !(id in data)) {
        res.status(400).json({
            message: "Invalid id"
        })
        return
    }

    res.status(200).json({
        data: {
            ...data[id]
        }
    })
})

app.listen(3000, () => {
    console.log('Server started at 3000')
})
