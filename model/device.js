const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;

const DeviceSchema = new Schema({
    mac: { type: String, unique: true },
    name: { type: String },
    model: { type: String },
    devno: { type: Number },
    caption: { type: String },
    level: { type: Number },
    ip: { type: String },
    subNet: { type: String },
    gateway: { type: String },
    dns: { type: String },
    wareversion: { type: String },
    active: { type: Boolean, default: true },
    port:[{
        number: { type: Number },
        caption: { type: String },
        mic: {
            type: ObjectId, ref: "Device"
        }
    }],
    mic: [{
        type: ObjectId, ref: "Device"
    }],
    isRostrum: { type: Boolean },
    allowSpeak: { type: Boolean , default: true},
    tone: [
        {
            Hz: { type: Number },
            decibel: { type: Number },
            q: { type: Number },
        }
    ],
    speakModel: { type: Number },
    company: {
            type: ObjectId, ref: "Company"
        },
    room: {
        type: ObjectId, ref: "MeetingRoom"
    },
    status: {type: Number, default: 0},
    camera: { type: Number, default: -1}
})

/*DeviceSchema.post('find', function(result) {
  // prints number of milliseconds the query took
  console.log('find() took ' + (Date.now() - this.start) + ' millis');
  let port = process.env.PORT || '3000'
  result.map(device => {
      if(device.ip){
          let ipFormat = [];
          for(var i = 0; i < device.ip.length; i=i+2){
              ipFormat.push(parseInt(device.ip.substr(i,2), 16))
          }
          device.ip = ipFormat.join(".")
      }
  })
});*/

const Device = mongoose.model("Device", DeviceSchema);
module.exports = Device;
