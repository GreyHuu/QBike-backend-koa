// 骑行单价 一分钟0.1元
const price = 0.1;

function changeContext(context, status, body) {
    context.status = status;
    context.body = body;
}

function isNull(ctx, ...object) {
    for (let i = 0; i < object.length; i++) {
        if (!object[i]) {
            changeContext(ctx, 200, {
                code: "202",
                msg: "参数错误"
            })
            return true;
        }
    }
}

module.exports = {
    changeContext,
    isNull,
    price
}
