import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";


const app = express()


app.use(cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN
}));

app.use(express.json({
    limit:"16kb"
}));

app.use(express.urlencoded({
    limit:'16kb',
    extended: true
}));

app.use(express.static('public'));

app.use(cookieParser());

// API V1 Router Imports
import AuthRouter from "./routes/auth.routes.js";
// API V1 Routes
app.use("/api/v1/auth", AuthRouter);

import ProfileRouter from "./routes/profile.routes.js";
app.use("/api/v1/profile", ProfileRouter);

import BroadCastCategory from './routes/broadcast.routes.js';
app.use("/api/v1/broadcast", BroadCastCategory);

import EventCategory from './routes/event.routes.js';
app.use("/api/v1/event",EventCategory);

import PodCasteRoute from './routes/podcast.routes.js';
app.use("/api/v1/podcast", PodCasteRoute);

import RecentlyRoute from './routes/recently.routes.js';
app.use("/api/v1/recent", RecentlyRoute);

export { app }