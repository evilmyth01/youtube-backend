import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const app = express();

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true,
}))

app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.route.js";
import tweetRouter from "./routes/tweet.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import playlistRouter from "./routes/playlist.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import LikeRouter from "./routes/like.route.js";
import commentRouter from "./routes/comment.route.js";

app.use("/api/v1/user",userRouter);
app.use("/api/v1/video",videoRouter);
app.use("/api/v1/tweet",tweetRouter);
app.use("/api/v1/subscription",subscriptionRouter);
app.use("/api/v1/playlist",playlistRouter);
app.use("/api/v1/dashboard",dashboardRouter);
app.use("/api/v1/like",LikeRouter);
app.use("/api/v1/comment",commentRouter);



export default app;