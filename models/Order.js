const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//实例化数据模板
const OrderSchema = new Schema({
    // 用户id
    user_id: {
        type: String,
        required: true
    },
    // 单车id
    bike_id: {
        type: String,
        required: true
    },
    // 使用时间 单位s
    during_time: {
        type: Number,
        required: true,
        default: 0
    },
    // 费用 单位 毛
    money: {
        type: Number,
        required: true,
        default: 0
    },
    // 开始时间
    start_time: {
        type: Date,
        required: true,
        default: Date.now
    },
    // 结束时间
    end_time: {
        type: Date,
        required: true,
        default: Date.now
    },
    // 订单状态  0 使用中  1 订单完结
    status: {
        type: Number,
        required: true,
        default: 0
    }
})
module.exports = mongoose.model("orders", OrderSchema);
