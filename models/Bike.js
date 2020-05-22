const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {markerImageUri} = require("../config/keys");
//实例化数据模板
const BikeSchema = new Schema({
    // 经度
    location_x: {
        type: String,
        required: true
    },
    // 纬度
    location_y: {
        type: String,
        required: true
    },
    uri: {
        type: String,
        required: true,
        default: markerImageUri
    },
    // 状态   0 在线  1 离线  2使用中
    status: {
        type: Number,
        required: true,
        default: 0
    },
})
module.exports = mongoose.model("bikes", BikeSchema);
