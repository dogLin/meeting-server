const MeetingController = require("../../controller/meeting");
const routerValicate = require('../../middlewares/routerValidate')

module.exports = router => {
    router.get("/meeting", MeetingController.getRoomsMeeting)
        .get("/roomAllMeeting", MeetingController.getAllRoomsAllMeetingByUser)
        .post("/meeting", MeetingController.orderMeeting)
        .put("/meeting/:id", MeetingController.updateMeeting)
        .del("/meeting/:id", MeetingController.deleteMeeting)
        .put("/meetingSign", MeetingController.meetingSign)
        .get("/meetingVote", MeetingController.getVote)
        .post("/meetingVote", routerValicate, MeetingController.meetingVote)
        .del("/meetingVote/:id", MeetingController.delMeetingVote)
        .post("/meetingUserVote", MeetingController.userVote)
        .post("/endMeetingVote", MeetingController.endMeetingVote)
        .post("/uploadAttachment", MeetingController.uploadAttachment)
        .post("/startMeeting", MeetingController.startMeeting)
        .post("/joinMeeting", MeetingController.joinMeeting)
        .post("/endMeeting", MeetingController.endMeeting)
}