const UserController = require("../../controller/user");

module.exports = router => {
    router.post("/register", UserController.register);
    router.post("/login", UserController.login);
    router.post("/ifExist", UserController.ifExist);
    router.get("/test", UserController.test);
    router.get("/users", UserController.query);
}