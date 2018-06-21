const DeptModel = require("../model/department");
const UserModel = require("../model/user");

class UserService {
    aggregateDepAndUser(depts) {
        return DeptModel.aggregate([{
                $match: {
                    _id: {$in : depts}
                }
            },
            {
                $unwind: "$members"
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'members',
                    foreignField: '_id',
                    as: 'members'
                }

            },
            {
                $group: {
                    _id: '$_id',
                    members: {
                        $addToSet: { $arrayElemAt: [ "$members", 0 ] }
                    },
                    name: {
                        $first: '$name'
                    },
                    parent: {
                        $first: '$parent'
                    }
                }
            }
        ]);
    }
}

module.exports = new UserService()