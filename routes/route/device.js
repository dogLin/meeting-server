const DeviceController = require("../../controller/device");

module.exports = router => {
    router.get("/device", DeviceController.getDevice)
        .post("/downMember", DeviceController.downMember)
        .post("/delMember", DeviceController.delMember)
        .post("/appointRostrum", DeviceController.appointRostrum)
        .post("/dismissRostrum", DeviceController.dismissRostrum)
        .post("/prohibitAllSpeak", DeviceController.prohibitAllSpeak)
        .post("/permitAllSpeak", DeviceController.permitAllSpeak)
        .post("/delAllMember", DeviceController.delAllMember)
        .post("/speakUnitContorl", DeviceController.speakUnitContorl)
        .post("/tone", DeviceController.tone)
        .post("/burnDevice", DeviceController.burnDevice)
        .post("/netDevice", DeviceController.netDevice)
        // .post("/meetingOperate", DeviceController.meetingOperate)
        .post("/switchModel", DeviceController.speakModel)
        .post("/deviceConfigure", DeviceController.deviceConfigure)
        .post("/cameraMove", DeviceController.cameraMove)
        .post("/setUpCameraLo", DeviceController.setUpCameraLo)
        .post("/getCameraLo", DeviceController.getCameraLo)
        .post("/delCameraLo", DeviceController.delCameraLo)
}