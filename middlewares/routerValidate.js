module.exports = async (ctx, next) => {
    if(ctx.state.user.data.isAdmin) {
       await next()
    }
    else {
        ctx.body = {
            success: false,
            msg: "用户权限不足调用此api"
        }
    }
}