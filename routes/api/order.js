const Router = require("koa-router");
const router = new Router();
const {changeContext} = require("../../config/utils")
// 引入Bike
const Order = require("../../models/Order");
const {endOrder} = require("../../config/publicDBToDo");
const {addOrder} = require("../../config/publicDBToDo");
const {isNull} = require("../../config/utils")
let resMsg;

/**
 * @route GET api/orders/get-order-list
 * @param id 用户id
 * @desc 获得某用户的全部订单的信息
 */
router.get("/get-order-list", async ctx => {
    resMsg = null;
    const {id} = ctx.request.query;
    if (isNull(ctx, id)) {
        return;
    }
    const findResult = await Order.find({user_id: id})
    if (findResult.length > 0) {
        resMsg = {
            code: "100",
            msg: findResult
        };
    } else {
        resMsg = {
            code: "101",
            msg: "该用户暂无订单信息！"
        };
    }
    await changeContext(ctx, 200, resMsg)
})

/**
 * @route post api/orders/add-order
 * @param userId 用户id bikeId 单车id
 * @desc 增加订单
 */
router.post("/add-order", async ctx => {
    resMsg = null;
    const {userId, bikeId} = ctx.request.body;
    if (isNull(ctx, userId, bikeId)) {
        return;
    }
    await addOrder(userId, bikeId, msg => {
        resMsg = msg;
    })
    await changeContext(ctx, 200, resMsg)
})

/**
 * @route post api/orders/end-order
 * @param orderId 订单id
 * @desc 关闭订单
 */
router.post("/end-order", async ctx => {
    resMsg = null;
    const {orderId} = ctx.request.body;
    if (isNull(ctx, orderId)) {
        return;
    }
    await endOrder(orderId, msg => {
        resMsg = msg;
    })
    await changeContext(ctx, 200, resMsg)
})

module.exports = router.routes();
