const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const IPv4 = require('../utils/os')

const ObjectId = Schema.Types.ObjectId;

const DepartmentSchema = new Schema({
    name: String,
    parent: {
        type:ObjectId,
        ref: 'Department'
    },
    leader: {
        type: ObjectId,
        ref: "User"
    },
    members: [{
        type: ObjectId,
        ref: "User"
    }]
})

DepartmentSchema.post('aggregate', function (result) {
    // prints number of milliseconds the query took
    let port = process.env.PORT || '3000'
    if (result) {
        result.map(res => {
            res.members.map(user => {
                user.avatar = user.avatar ? 'http://' + IPv4.address + ':' + port + '/' + user.avatar : ''
            })
        })
    }
});

const Department = mongoose.model("Department", DepartmentSchema);

module.exports = Department;