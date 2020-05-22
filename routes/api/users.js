const Router = require("koa-router");
const router = new Router();
const {changeContext} = require("../../config/utils")
// 引入User
const User = require("../../models/User");
// 引入手机验证码
const PhoneCode = require("../../config/getPhoneCode");
// 引入根据邮箱生成默认头像
const gravatar = require('gravatar');
// 引入哈希密码加密模块
const bcrypt = require("bcryptjs");
const {isNull} = require("../../config/utils");
// 验证码
let nowCode;
let resMsg;
/**
 * @route GET api/users/test
 * @desc 测试接口地址
 * @access 接口公开
 */
router.get("/test", async ctx => {
    resMsg = null;
    changeContext(ctx, 200, {
        msg: "user working11.."
    });
})
/**
 * @route GET api/users/register/
 * @param phone
 * @type {dispatch}
 */
router.get("/phone-code", async ctx => {
    nowCode = null;
    resMsg = null;
    const {phone} = ctx.request.query;
    if (isNull(ctx, phone)) {
        return;
    }
    await PhoneCode(phone, async (err, body, code) => {
        const {return_code} = body;
        if (return_code === "00000") {
            nowCode = code;
            resMsg = {
                code: "100",
                msg: "验证码成功发送！"
            };
        } else {
            resMsg = {
                code: "101",
                msg: "验证码成功失败！"
            };
        }
    });
    await changeContext(ctx, 200, resMsg)
})
/**
 * @route POST api/users/compare-code
 * @param code
 * @desc 进行验证码的比对
 */
router.get("/compare-code", async ctx => {
    resMsg = null;
    const {code} = ctx.request.query;
    if (isNull(ctx, code)) {
        return;
    }
    if (parseInt(code) === parseInt(nowCode)) {
        resMsg = {
            status: "100",
            msg: "验证正确"
        };
    } else {
        resMsg = {
            status: "101",
            msg: "验证错误"
        };
    }
    await changeContext(ctx, 200, resMsg)
})
/**
 * @route POST api/users/forget
 * @param phone 手机号 password 密码
 * @desc 重置密码
 */
router.post("/forget", async ctx => {
    resMsg = null;
    const {phone, password} = ctx.request.body;
    if (isNull(ctx, phone, password)) {
        return;
    }
    await bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            await User.findOneAndUpdate({phone}, {
                password: hash
            })
        });
    })

    resMsg = {
        code: "100",
        msg: "重置密码成功"
    };

    await changeContext(ctx, 200, resMsg)
})
/**
 * @route POST api/users/register
 * @param phone 手机号 password 密码
 * @desc 注册接口
 */
router.post("/register", async ctx => {
    resMsg = null;
    const {phone, password} = ctx.request.body;
    if (isNull(ctx, phone, password)) {
        return;
    }
    // 进行查询
    const findResult = await User.find({phone: phone});
    // 判断查询结果
    if (findResult.length > 0) {
        resMsg = {
            code: "101",
            msg: "该手机号已经注册，请登录！"
        };
    } else {
        const avatarArr = gravatar.url(`${phone}10086@gmail.com`
            , {s: '200', r: 'pg', d: 'mm'}).split("/");
        const avatar = avatarArr[2] + "/" + avatarArr[3] + "/" + avatarArr[4];
        const newUser = new User({
            name: phone,
            phone,
            password,
            avatar
        })
        // 存储到数据库
        await newUser
            .save()
            .then(() => {
                resMsg = {
                    code: "100",
                    msg: "注册成功！"
                };
            }).catch(e => {
                resMsg = {
                    code: "101",
                    msg: e
                };
                console.log(e);
            });
    }
    await changeContext(ctx, 200, resMsg)
})

/**
 * @route POST api/users/login
 * @param name 账号   password   密码
 * @desc 登录接口
 */
router.post("/login", async ctx => {
    resMsg = null;
    const {name, password} = ctx.request.body;
    if (isNull(ctx, name, password)) {
        return;
    }
    // 进行查询
    const findResult = await User.findOne({name: name});
    if (findResult) { // 有结果
        // 加密比较密码
        const isMatch = bcrypt.compareSync(password, findResult.password);
        if (isMatch) { // 匹配
            const {id, name, avatar} = findResult
            resMsg = {
                code: "100",
                msg: {
                    id,
                    name,
                    avatar
                }
            };
        } else { // 不匹配
            resMsg = {
                code: "101",
                msg: "手机号或密码错误！"
            };
        }
    } else { // 无结果
        resMsg = {
            code: "101",
            msg: "用户不存在"
        };
    }
    await changeContext(ctx, 200, resMsg)
})

/**
 * @route GET api/users/current-user
 * @param id 要查询的用户id
 * @desc 查询当前登录用户的详细信息
 */
router.get("/current-user", async ctx => {
    resMsg = null;
    const {id} = ctx.request.query;
    if (isNull(ctx, id)) {
        return;
    }
    // 进行查询
    const findResult = await User.findById(id);
    if (findResult) { // 有结果
        resMsg = {
            code: "100",
            msg: findResult
        };
    } else { // 不匹配
        resMsg = {
            code: "101",
            msg: "用户id错误！"
        };
    }
    await changeContext(ctx, 200, resMsg)
})
/**
 * @route POST api/users/recharge-money
 * @param id 充值的用户id money  充值的钱数
 * @desc 给此用户充值
 */
router.post("/recharge-money", async ctx => {
    resMsg = null;
    const {id, money} = ctx.request.body;
    if (isNull(ctx, id, money)) {
        return;
    }
    // 进行查询
    const findResult = await User.findById(id);
    if (findResult) { // 有结果
        findResult.money += parseFloat(money);
        await User.updateOne({_id: id}, findResult, async (err, ret) => {
            if (err) {  // 失败
                resMsg = {
                    code: "101",
                    msg: "充值失败！"
                };
            } else { // 成功
                resMsg = {
                    code: "100",
                    msg: "充值成功"
                };
            }
        });
    } else { // 不匹配
        resMsg = {
            code: "101",
            msg: "用户id错误！"
        };
    }
    await changeContext(ctx, 200, resMsg)
})
/**
 * @route get api/users/get-money
 * @param id 用户id
 * @desc 获得用户的当前钱数
 */
router.get("/get-money", async ctx => {
    resMsg = null;
    const {id} = ctx.request.query;
    if (isNull(ctx, id)) {
        return;
    }
    // 进行查询
    const findResult = await User.findById(id);
    if (findResult) { // 有结果
        resMsg = {
            code: "101",
            msg: findResult.money
        };
    } else { // 不匹配
        resMsg = {
            code: "101",
            msg: "用户id错误！"
        };
    }
    await changeContext(ctx, 200, resMsg)
})
module.exports = router.routes();
