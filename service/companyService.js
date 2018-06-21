const Company = require('../model/company');
const mongoose = require('mongoose');

class CompanyService {
    queryCompanyDepts(companyId){
        return Company.findById(companyId)
        /*return Company.aggregate([
            {
                $match : { _id : mongoose.Types.ObjectId(companyId) }
            },
            {
                $replaceRoot: { newRoot: "$departments" }
            }
        ]);*/
    }
}

module.exports = new CompanyService();