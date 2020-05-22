const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// 引入哈希密码加密模块
const bcrypt = require("bcryptjs");
//实例化数据模板
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    // 钱包钱数
    money: {
        type: Number,
        required: true,
        default: 0
    },
    // 头像
    avatar: {
        type: String,
    },
    date: {
        type: Date,
        // Date.now 是一个函数    即当前模型创建时的时间
        // Date.now()是一个值     即系统启动的时间
        default: Date.now
    }
})
// 在保存前将密码加密
UserSchema.pre("save", function (next) {
    // 密码加密
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(this.password, salt, (err, hash) => {
            this.password = hash;
            next();
        });
    })
})
// 使用比较方法比较密码是否正确
UserSchema.methods.comparePassword = async function (candidatePassword, cb) {
    const res = bcrypt.compareSync(candidatePassword, this.password);
    await cb(res);
};
module.exports = mongoose.model("users", UserSchema);
