/****
 * 初始化公司个人信息和部门等信息的文件，只要执行一次，所以在需要的时候单独执行
 */

const Auth = require('./auth');
const Department = require('./department')
const User = require("./user")
let db = require("../model/db");
const UserModel = require('../model/user')
const DeptModel = require('../model/department')
const CompanyModel = require('../model/company')
const bcrypt = require("bcrypt")
const {downloadFile} = require('../upload')

async function test() {
    let token = await Auth.getAccessToken();
    try {
        // 获取部门列表
        let { department } = await Department.list(token)// {autoAddUser: true, createDeptGroup:true,id:1,name:"江苏中协智能科技有限公司"，parentid:1}
        // 获取所有部门的详情
        let userList = [];
        let proArray = department.map(dept => {
            return (async (dept) => {
                let deptInfo = await Department.get(token, dept.id)
                dept.order = deptInfo.order;
                dept.orgDeptOwner = deptInfo.orgDeptOwner;
                dept.groupContainSubDept = deptInfo.groupContainSubDept;
                dept.sourceIdentifier = deptInfo.sourceIdentifier;
                let deptUsers = await User.list(token, dept.id);
                userList = userList.concat(deptUsers.userlist)
                dept.deptUsers = deptUsers.userlist
            })(dept)
        })
        await Promise.all(proArray);
        // 获取企业信息
        let company = department.filter(dept => dept.id == 1)[0]
        // 获取董事长信息
        let boss = userList.find(user => user.userid == company.orgDeptOwner)
        // 保存董事长
        let userResult = await UserModel.create(await formateUser(boss))
        // // 保存公司信息
        let companyResult = await CompanyModel.create({
            name: company.name,
            bossName: boss.name,
            boss: userResult._id
        })

        await UserModel.update({_id: userResult._id},{company: companyResult._id})
        // 重建部门的层级结构
        department = department.filter(dept => {
            if(dept.parentid && dept.parentid !== 1) {
                let parentDept = department.find(item => 
                    item.id == dept.parentid
                )
                if (parentDept) {
                    parentDept.children = parentDept.children || [];
                    parentDept.children.push(dept)
                }
                return false
            }
            if (dept.id == 1) {
                return false
            }
            return true
        })
        // console.dir(JSON.stringify(department,null,2))
        await saveDeptAndUsers(department,undefined,companyResult._id)
        //  保存到文本
        // let fs = require("fs");
        // fs.writeFileSync('./dept.json',JSON.stringify(department,null,2))
    } catch (error) {
        console.log(error)
    }

}

async function formateUser(user) {
    let { name, isAdmin, isBoss, email, isLeader, mobile: phone, userid ,avatar} = user;
    if(avatar) {
        console.log(await downloadFile(avatar))
        avatar = await downloadFile(avatar)
    }
    user = { name, isAdmin, isBoss, email, isLeader, phone, userid, avatar }
    user.isDing = true;
    user.pass = bcrypt.hashSync("123456",5);
    return user;
};


async function saveDeptAndUsers(depts,parent,company_id) {
    let proArray = depts.map(item => {
        return (async (dept) => {
            try {
                let deptResult = await DeptModel.create({
                name: dept.name,
                parent: parent
            });
            await CompanyModel.update({_id: company_id}, {$addToSet:{departments: deptResult._id}})
            dept.deptUsers.map(async (user) => {
                let data = await UserModel.findOne({userid: user.userid});
                let userResult;
                if(data) {
                    try {
                        userResult = await UserModel.update({userid: user.userid},{$addToSet:{
                        department: deptResult._id
                    }})
                    } catch (error) {
                        console.log(error)
                    }
                    
                }else {
                    user = await formateUser(user);
                    user.department = [deptResult._id];
                    user.company = company_id
                    userResult = await UserModel.create(user)
                }
                await DeptModel.update({_id: deptResult._id},{$addToSet:{members: userResult._id}})
            })
            if (dept.children) {
                await saveDeptAndUsers(dept.children, deptResult._id,company_id)
            }
            } catch (error) {
                console.log(error)
            }
            
        })(item)
    })
    try {
        await Promise.all(proArray)
    } catch (error) {
        console.log(error)
    }
}

// test();
