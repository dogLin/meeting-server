const {
    getMeetingRoom,
    addMeetingRoom,
    updateMeetingRoom,
    deleteMeetingRoom,
    checkRoom
} = require("../../controller/meetingRoom");
const routerValicate = require('../../middlewares/routerValidate')

module.exports = router => {
    router.get("/meetingRoom", getMeetingRoom)
        .get("/allMeetingRoom", getMeetingRoomByCompany)
        .post("/meetingRoom", routerValicate, addMeetingRoom)
        .put("/meetingRoom/:id", routerValicate, updateMeetingRoom)
        .del("/meetingRoom/:id", routerValicate, deleteMeetingRoom)
        .get("/checkRoom", checkRoom)
}