const Router = require("koa-router");
const router = new Router();
const {changeContext} = require("../../config/utils")
// 引入Bike
const Bike = require("../../models/Bike");
const Order = require("../../models/Order")
const {endOrder} = require("../../config/publicDBToDo");
// 公共
const {isNull} = require("../../config/utils");

// 公共数据库操作
const {addOrder} = require("../../config/publicDBToDo")
let resMsg;
/**
 * @route GET api/bikes/get-bike-list
 * @param 无
 * @desc 获得全部单车的信息
 */
router.get("/get-bike-list", async ctx => {
    resMsg = null;
    const findResult = await Bike.find();
    if (findResult.length > 0) {
        resMsg = {
            code: "100",
            msg: findResult
        };
    } else {
        resMsg = {
            code: "101",
            msg: "暂无单车信息！"
        };
    }
    await changeContext(ctx, 200, resMsg)
})

/**
 * @route POST api/bikes/add-bike
 * @param location_x 经度 location_y 纬度
 * @desc 增加单车
 */
router.post("/add-bike", async ctx => {
    resMsg = null;
    const {location_x, location_y} = ctx.request.body;
    if (isNull(ctx, location_x, location_y)) {
        return;
    }
    const newBike = new Bike({
        location_x,
        location_y
    })
    // 存储到数据库
    await newBike
        .save()
        .then(() => {
            resMsg = {
                code: "100",
                msg: "添加成功！"
            };
        }).catch(e => {
            resMsg = {
                code: "101",
                msg: "添加失败！"
            };
        });
    await changeContext(ctx, 200, resMsg)
})

/**
 * @route POST api/bikes/change-status
 * @param id 单车id status 要改变的状态码  0 在线  1 离线  2 使用中
 * @desc 修改单车状态
 */
router.post("/change-status", async ctx => {
    resMsg = null;
    const {id, status} = ctx.request.body;
    if (isNull(ctx, id, status)) {
        return;
    }
    const findResult = await Bike.findByIdAndUpdate(id, {status: status});
    if (findResult) {
        resMsg = {
            code: "100",
            msg: "修改成功"
        };
    } else {
        resMsg = {
            code: "101",
            msg: "暂无单车信息！"
        };
    }
    await changeContext(ctx, 200, resMsg)
})

/**
 * @route GET api/bikes/apply-use
 * @param bikeId 单车id  userId 用户id
 * @desc 请求开锁使用单车
 */
router.get("/apply-use", async (ctx, next) => {
    resMsg = null;
    const {bikeId, userId} = ctx.request.query;
    if (isNull(ctx, bikeId, userId)) {
        return;
    }
    const findResult = await Bike.findById(bikeId)
    if (findResult) {
        if (parseInt(findResult.status) === 0) {
            const updateResult = await Bike.findByIdAndUpdate(bikeId, {status: 1});
            if (updateResult) {
                resMsg = {
                    code: "100",
                    msg: "开锁成功"
                }
                await next();
                if (resMsg.code !== "100") {
                    await changeContext(ctx, 200, resMsg);
                    return;
                }
            } else {
                resMsg = {
                    code: "102",
                    msg: "开锁失败,服务器错误"
                }
            }
        } else {
            resMsg = {
                code: "103",
                msg: "开锁失败,单车正在使用中。。。"
            }
        }
    } else {
        resMsg = {
            code: "101",
            msg: "暂无单车信息！"
        }
    }
    await changeContext(ctx, 200, resMsg);
}, async ctx => {
    const {userId, bikeId} = ctx.request.query;
    await addOrder(userId, bikeId, msg => {
        resMsg = msg;
    })
})
/**
 * @route GET api/bikes/apply-clock
 * @param id 单车id
 * @desc 请求关闭单车
 */
router.get("/apply-clock", async (ctx, next) => {
    resMsg = null;
    const {orderId} = ctx.request.query;
    if (isNull(ctx, orderId)) {
        return;
    }
    const findResult = await Order.findById(orderId)
    if (findResult) {
        // 对订单的操作
        await next();
        // 订单正在使用中
        if (parseInt(findResult.status) === 0) {
            // 订单结束失败
            if (resMsg.code !== "100") {
                await changeContext(ctx, 200, resMsg);
                return;
            }
            const updateResult = await Bike.findByIdAndUpdate(findResult.bike_id, {status: 0});
            if (updateResult) {
                resMsg = {
                    code: "100",
                    msg: "关锁成功"
                }
            } else {
                resMsg = {
                    code: "102",
                    msg: "关锁失败,服务器错误"
                }
            }

        } else {
            resMsg = {
                code: "103",
                msg: "关锁失败,订单已完结。。。"
            }
        }
    } else {
        resMsg = {
            code: "101",
            msg: "暂无订单信息！"
        }
    }
    await changeContext(ctx, 200, resMsg);
}, async ctx => {
    const {orderId} = ctx.request.query;
    await endOrder(orderId, msg => {
        resMsg = msg;
    })
})
module.exports = router.routes();
