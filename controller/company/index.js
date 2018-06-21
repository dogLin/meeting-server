let CompanyModel = require('../../model/company');

class CompanyController {
    static constructor() {}

    static async ifCompanyExist (ctx, next) {
        let {name} = ctx.request.body
        let company = await CompanyModel.find({name});
        if (!!company.length) {
            ctx.throw(406, "公司名已存在")
        }
        ctx.body = {
            success: true,
            msg: "公司名可用"
        }
        await next();
        
    }

    /**
     * 创建公司
     * @param {*} ctx 
     * @param {*} next 
     */
    static async createCompany (ctx, next) {
        let {name} = ctx.request.body;
        let user = ctx.state.user.data;
        if (!user ) {
            ctx.throw(401)
        }
        if (!name ) {
            ctx.throw(400, {message: "企业名字不能为空"})
        }    
        let result = await CompanyModel.create({
            name,
            boss: user._id,
            bossName: user.name,
            avatar: '',
        }).catch(e => ctx.throw(500,{message: "插入失败"}))
        ctx.body = {
            success: true,
            msg: "创建企业成功",
            data: result._doc
        }     
    }
}

module.exports = CompanyController;