//const moment = require('moment')
const type = require('./utils/type')
const buf = Buffer.alloc(2);
const dateBuf = Buffer.allocUnsafe(8);
console.log(buf)
buf.writeUInt8(0x1);
buf.writeUInt8(0x11,1);
let buf1 = new Buffer(buf, 'hex')
//buf.write('3', 1);
console.log(buf)
console.log(buf1)

/*let ddd = [0x74, 0xe9, 0x73, 0x74]
let dddBuf = Buffer.from([0x74, 0xe9, 0x73, 0x74])
let date = moment().unix();
console.log(moment(date).toDate())
dateBuf.writeIntLE(date, 0, 8)

console.log(buf)
console.log(buf.toString())
console.log(ddd.length,'-----buf', dddBuf, '-----bufLen', dddBuf.length)
console.log(date, '-----buf', dateBuf, '-----bufLen', dateBuf.readIntLE(0, 8))
console.log(typeof('dasfas'))

const buf1 = new Buffer(8);
const buf2 = new Buffer(8);
const buf3 = new Buffer(12);

buf1.writeUIntBE(7001, 0, 2);
let num = 811
console.log(buf1.write(0+num.toString(16), 2, 4, 'hex'))
//buf2.writeUIntLE(7001, 0, 2);
buf2.write('591b', 'hex')
buf3.write('68656c6c6f2c20776f726c6421', 'hex')
// <Buffer 01 51 0f 0f 63 04>

// 1447656645380
console.log( '-----buf1', buf1, '-----buf1Len', buf1.readUIntBE(0, 2),'-----buf2', buf2, '-----buf2Len', buf2.readUIntLE(0, 8))
console.log(buf3)
console.log('-----buf3-String----'+buf3.toString())


// 读取一条记录
// buf    Buffer对象
// offset 本条记录在Buffer对象的开始位置
// data   {number, lesson, score}
/*function writeRecord (buf, offset, data) {
  buf.writeUIntBE(data.number, offset, 3);
  buf.writeUInt16BE(data.lesson, offset + 3);
  buf.writeInt8(data.score, offset + 5);
}

// 写入一条记录
// buf    Buffer对象
// offset 本条记录在Buffer对象的开始位置
function readRecord (buf, offset) {
  return {
    number: buf.readUIntBE(offset, 3),
    lesson: buf.readUInt16BE(offset + 3),
    score: buf.readInt8(offset + 5)
  };
}

// 写入记录列表
// list  记录列表，每一条包含 {number, lesson, score}
function writeList (list) {
  var buf = new Buffer(list.length * 6);
  var offset = 0;
  for (var i = 0; i < list.length; i++) {
    writeRecord(buf, offset, list[i]);
    offset += 6;
  }
  return buf;
}

// 读取记录列表
// buf  Buffer对象
function readList (buf) {
  var offset = 0;
  var list = [];
  while (offset < buf.length) {
    list.push(readRecord(buf, offset));
    offset += 6;
  }
  return list;
}

var list = [
  {number: 100001, lesson: 1001, score: 99},
  {number: 100002, lesson: 1001, score: 88},
  {number: 100003, lesson: 1001, score: 77},
  {number: 100004, lesson: 1001, score: 66},
  {number: 100005, lesson: 1001, score: 55},
];
console.log(list);

var buf4 = writeList(list);
console.log(buf4);
// 输出 <Buffer 01 86 a1 03 e9 63 01 86 a2 03 e9 58 01 86 a3 03 e9 4d 01 86 a4 03 e9 42 01 86 a5 03 e9 37>

var ret = readList(buf4);
console.log(ret);
/* 输出
[ { number: 100001, lesson: 1001, score: 99 },
  { number: 100002, lesson: 1001, score: 88 },
  { number: 100003, lesson: 1001, score: 77 },
  { number: 100004, lesson: 1001, score: 66 },
  { number: 100005, lesson: 1001, score: 55 } ]
*/

/*const buf1 = Buffer.alloc(10);
const buf2 = Buffer.alloc(14);
const buf3 = Buffer.alloc(18);
const totalLength = buf1.length + buf2.length + buf3.length;

// 输出: 42
console.log(totalLength);

const bufA = Buffer.concat([buf1, buf2], totalLength);

// 输出: <Buffer 00 00 00 00 ...>
console.log(bufA);

// 输出: 42
console.log(bufA.length);*/

/*const ProtocolService = require('./service/deviceProtocolService')
const defineConstants = require('./service/constantService')
const IPv4 = require('./utils/os')
//const DeviceService = require('./service/deviceService');

let protocol1 = new ProtocolService(new Buffer([0x54, 0x01]), new Buffer([0x00, 0x00]), new Buffer([0x63, 0x00]), 0x0064, new Buffer([0x1b, 0x59]))
let protocol2 = new ProtocolService(0x5401, 0x0000, 0x6300, 0x0064, 0x1b59)

let buf2 = Buffer.from('2E4376695401000018101E000064630000021B59656E642E', 'hex')
let buf1 = protocol1.protocol
let buf11 = protocol2.protocol
console.log(buf1)
console.log(buf1.equals(buf11));

let buf3 = Buffer.from([0x54, 0x01]);
let buf4 = Buffer.from('5401', 'hex');
console.log(buf3.equals(buf4));
console.log(process.env)
console.log(moment().format("YYYYMMDDHHmmss")+0+moment().day())
console.log(Buffer.from(moment().format("YYYYMMDDHHmmss")+0+moment().day(), 'hex'))
console.log(require('os').networkInterfaces())*/

/*let constants = defineConstants({
  header: {
    id: "device_protocol_header",
    default: 'cvi'
  },
  end: {
    id: "device.protocol.end",
    default: 'end'
  },
  powerModel: {
    id: "device_powerctrl_model"
  }
})*/

//DeviceService.deviceHearts()





