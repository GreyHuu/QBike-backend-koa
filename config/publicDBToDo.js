const Order = require("../models/Order");
const {price} = require("./utils");
const User = require("../models/User");

async function addOrder(userId, bikeId, cb) {
    const newOrder = new Order({
        user_id: userId,
        bike_id: bikeId
    })
    const addResult = await newOrder.save();
    if (addResult) {
        cb({
            code: "100",
            msg: {
                message: "单车开锁完成，订单添加成功！",
                orderId: addResult._id
            }
        });

    } else {
        cb({
            code: "104",
            msg: "单车开锁完成，订单添加失败！"
        });
    }
}

async function endOrder(orderId, cb) {
    const findResult = await Order.findById(orderId);
    if (findResult) {
        const sTime = findResult.start_time.getTime();
        const eTime = new Date();
        const during = ((eTime.getTime() - sTime) / 1000).toFixed(0);
        const money = Math.ceil(during / 60) * 0.1;
        const nowUser = await User.findById(findResult.user_id);
        // 钱数不够
        if (nowUser.money < 3) {
            cb({
                code: "106",
                msg: "用户金额不够，完结订单失败！"
            });
            return;
        }
        // 更新订单状态
        const updateOrderResult = await Order.findByIdAndUpdate(orderId, {
            during_time: during,
            end_time: eTime,
            status: 1,
            money: money > 3 ? money : 3
        }).catch(e => {
            console.log(e);
        })

        nowUser.money -= money;
        // 扣除用户钱数
        const updateUserResult = await User.findByIdAndUpdate(findResult.user_id, nowUser)
        if (updateOrderResult && updateUserResult) {
            cb({
                code: "100",
                msg: "订单完结"
            });
        } else {
            cb({
                code: "105",
                msg: "订单结束失败"
            });
        }

    } else {
        cb({
            code: "104",
            msg: "单车开锁完成，订单添加失败！"
        });
    }
}

module.exports = {
    addOrder,
    endOrder
}
