const UserModel = require("../../model/user");
const UserService = require("../../service/userService");
const CompanyService = require("../../service/companyService");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const token = require("../../config").token;
const DeviceService = require('../../service/deviceService');

const UserController = {

    ifExist: async (ctx, next) => {
        let {userName, email} = ctx.request.body;
        let able = true;
        try {
            if (userName) {
                let user = await UserModel.find({userName})
                if (!!user.length) {
                    ctx.throw(406,{message:"用户名已存在"})
                    able = false;
                }
              
            } 
            if (email) {
                let user = await UserModel.find({email})
                if (!!user.length) {
                    ctx.throw(406,{message:"邮箱已存在"})
                    able = false;
                }
            }
            if(able) {
                ctx.body = {
                    success: true,
                    msg: "可用"
                }
            }
            return able
        } catch (error) {
            throw error
        }

    },

    register: async (ctx, next) => {
        let { userName, pass, email} = ctx.request.body;
        if (!pass || !userName || !email) {
            ctx.throw(400, {message: "用户名，密码和邮箱不能为空"})
        }
        try {
            let able = await UserController.ifExist(ctx,next)
            pass = bcrypt.hashSync(pass,5);
            await UserModel.create({userName, pass, email, name: userName})
            ctx.status = 201;
            ctx.body = {
                success: true,
                msg: "注册成功"
            }
        } catch (error) {
            throw(error)
        }
        

    },

    login: async (ctx, next) => {
        let {userName, pass} = ctx.request.body;

        if (!userName || !pass) {
            ctx.throw(401, {message: '用户名或密码不能为空'});
        }
        try {
            let user = await UserModel.findOne({"$or":[{userName},{email: userName},{phone: userName}]});
            if (!user) {
                ctx.throw(401, {message: '用户名或密码错误'});
            }
            let checkPass = bcrypt.compareSync(pass,user.pass);
            delete user.pass
            if (checkPass) {
                ctx.status = 200
                let data = JSON.parse(JSON.stringify(user))
                data.priority = user.priority;
                ctx.body = {
                    success: true,
                    msg: '登录成功',
                    data:{
                        token: jsonwebtoken.sign({
                            data: data,
                            // 设置token过期时间
                            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 60 seconds * 60 minutes = 1 hour
                        },token.secret),
                    }
                }
            } else {
                ctx.throw(401, {message: '用户名或密码错误'});
            }
        } catch (error) {
            throw(error)
        }
        
    },

    test: async (ctx, next) => {
        console.log(ctx);
        console.log(ctx.state.user.data);
        ctx.body = {
            success: true,
            msg: '测试token获取用户信息',
            data: {
                user: ctx.state.user.data
            }
        }
    },

    query: async (ctx) => {
        try {
            let companyRes = await CompanyService.queryCompanyDepts(ctx.state.user.data.company)
            let depAndUser = await UserService.aggregateDepAndUser(companyRes.departments)
            depAndUser = depAndUser.filter(dept => {
                if(dept.parent) {
                    let parentDept = depAndUser.find(item => 
                        item._id.toString() == dept.parent.toString()
                    )
                    if (parentDept) {
                        parentDept.children = parentDept.children || [];
                        parentDept.children.push(dept)
                    }
                    return false
                }
                return true
            })
            ctx.body = {
                success: true,
                msg: '返回公司及部门信息',
                data: depAndUser
            }
        } catch (error) {
            throw(error)
        }
        
    }
}

module.exports = UserController;