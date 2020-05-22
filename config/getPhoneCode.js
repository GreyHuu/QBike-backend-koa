const request = require("request")
//请求第三方短信接口的方法
module.exports = async function (phone, cb) {
    const code = randomNum(1000, 9999);
    cb("error", {
        "return_code": "00000"
    }, code);
    request({
        url: `http://yzxyzm.market.alicloudapi.com/yzx/verifySms?phone=${phone}&templateId=TP18040314&variable=code:${code}`,
        method: "POST",//请求方式，默认为get
        headers: {//设置请求头
            "Authorization": "APPCODE 1b65d1bc25484848b02e7041253d6527",
        },
    }, async function (error, response, body) {
        await cb(error, JSON.parse(body), code);
        console.log(body);
    });
}

//生成从minNum到maxNum的随机数
function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
            return 0;
    }
}
