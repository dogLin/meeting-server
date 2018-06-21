const mongoose = require("mongoose");
const constants = require('../utils/constants');
const IPv4 = require('../utils/os')

const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;

const UserSchema = new Schema({
    userName: {
        type: String
    },
    name: {
        type: String,
    },
    pass: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    avatar: {
        type: String
    },
    roles: [{
        type: ObjectId,
        // ref: 'Roles'  
    }],
    isAdmin: {
        type: Boolean
    },
    isBoss: {
        type: Boolean
    },
    isDing: {
        type: Boolean
    },
    userid: {
        type: String
    },
    company: {
        type: ObjectId,
        ref: "Company"
    },
    isLeader: {
        type: Boolean
    },
    department: [{
        type: ObjectId,
        ref: "Department"
    }],
    meetingRooms: [{
        type: ObjectId,
        ref: "MeetingRoom"
    }],
    meetings: [{
        type: ObjectId,
        ref: "Meeting"
    }],
    messages: [{
        content: String,
        time: String,
        ifRead: Boolean
    }]
})

UserSchema.post('findOne', function (result) {
    // prints number of milliseconds the query took
    if (result) {
        let port = process.env.PORT || '3000'
        result.priority = result.isAdmin ? constants.admin_priority : constants.user_priority;
        result.avatar = result.avatar ? 'http://' + IPv4.address + ':3000' + '/' + result.avatar : ''
    }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;