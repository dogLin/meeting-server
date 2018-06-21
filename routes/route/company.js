const CompanyController = require("../../controller/company");

module.exports = router => {
    router.post("/company/ifExist", CompanyController.ifCompanyExist)
    router.post("/company", CompanyController.ifCompanyExist ,CompanyController.createCompany)
}