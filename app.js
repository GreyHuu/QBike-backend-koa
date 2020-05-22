const Koa = require("koa");
const Router = require("koa-router");
const {changeContext} = require("./config/utils");
// 跨域
const cors = require("koa2-cors");
// 连接MongoDB
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false)
const dbURI = require("./config/keys").mongoURI;
// 用于格式化Post的body
const bodyParser = require("koa-bodyparser");
// 实例化Koa
const app = new Koa();
const router = new Router();
// 引入user
const users = require("./routes/api/users");
const bikes = require("./routes/api/bikes")
const orders = require("./routes/api/order")
// 连接数据库
mongoose.connect(dbURI,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then(() => {
        console.log("MongoDB Connected...");
    })
    .catch(e => {
        console.log(e);
    })


//路由
router.get("/", async ctx => {
    changeContext(ctx, 200, {
        msg: "Hello Koa"
    })
})
//绑定路由地址
router.use("/api/users", users);
router.use("/api/bikes", bikes);
router.use("/api/orders", orders);

// 跨域配置
app.use(cors({
    origin: function (ctx) {
        if (ctx.url === '/**') {
            return "*"; // 允许来自所有域名请求
        }
        return '*';
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))

// 使用bodyParser
app.use(bodyParser());
//配置路由
app.use(router.routes()).use(router.allowedMethods());


// 监听端口
const port = 5000;

app.listen(port, () => {
    console.log(`server started on ${port}...`);
})
