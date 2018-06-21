const type = require('./type')
const iconv = require('iconv-lite');

class Protocol {

    constructor(length, offset) {
        this.protocol = Buffer.alloc(length)
        this.offset = offset || 0
    }

    /*    get protocol() {
            return this.protocol ? this.protocol : Buffer.from();
        }*/

    /**
     * 构造协议
     * 
     * @param {any} protocolContent 
     * @memberof Protocol
     */
    structureProtocol(protocolContent) {
        for (let prop in protocolContent) {
            let data = protocolContent[prop].value;
            let dataType = type(data)
            switch (dataType) {
                case 'string':
                    this.writeStringToProtocol(prop, protocolContent[prop], protocolContent[prop].codedFormat)
                    break
                case 'number':
                    this.writeNumberToProtocol(prop, protocolContent[prop])
                    break
                case 'uint8array':
                    this.writeArayToProtocol(prop, protocolContent[prop])
                    break
                default:
                    throw ({message:`Buffer TypeError: ${dataType} is not allow`})
            }
        }
    }

    /**
     * 协议写入字符串
     * 
     * @param {any} key 
     * @param {any} data 
     * @returns 
     * @memberof Protocol
     */
    writeStringToProtocol(key, data, format) {
        if (type(data.value) === 'string' && data.offset === this.offset) {
            try {
                let str = data.value;
                if (format == 'gbk') {
                    str = str.padEnd((data.length-str.length), '0');
                    data.value = iconv.encode(str, 'gbk')
                    this.writeArayToProtocol(key, data)
                } else if(format == 'hex'){
                    str = str.padStart(data.length*2, '0');
                    let writeLen = this.protocol.write(str, this.offset, data.length, format);
                    this.offset += data.length ? data.length : writeLen;
                } 
                else {
                    //str = str.padStart(data.length, '0');
                    let writeLen = this.protocol.write(data.value, this.offset, data.length, format);
                    this.offset += data.length ? data.length : writeLen;
                }
                
                return {
                    success: true,
                    msg: `${key}成功写入协议`
                }
            } catch (error) {
                throw (error)
            }

        } else {
            return {
                success: false,
                msg: `${key}写入协议出错`
            }
        }
    }

    /**
     * 协议写入数字
     * 
     * @param {any} key 
     * @param {any} data 
     * @returns 
     * @memberof Protocol
     */
    writeNumberToProtocol(key, data) {
        if (type(data.value) === 'number' && data.offset === this.offset) {
            try {
                let numStr = data.value.toString(16);
                numStr = numStr.padStart(data.length * 2, '0');
                let writeLen = this.protocol.write(numStr, this.offset, 'hex')
                this.offset += data.length ? data.length : writeLen;
                return {
                    success: true,
                    msg: `${key}成功写入协议`
                }
            } catch (error) {
                throw (error)
            }
        } else {
            return {
                success: false,
                msg: `${key}写入协议出错`
            }
        }
    }

    /**
     * 协议写入数组
     * 
     * @param {any} key 
     * @param {any} data 
     * @returns 
     * @memberof Protocol
     */
    writeArayToProtocol(key, data) {
        if (type(data.value) === 'uint8array' && data.offset === this.offset) {
            try {
               /* for (var i=0; i<data.length; i++){
                    if(data.value[i]){
                        this.protocol.writeInt8(data.value[i], this.offset)
                        this.offset++;
                    }
                    else {
                        this.protocol.writeInt8(0x00, this.offset)
                        this.offset++;
                    }
                }*/
                data.value.map((value) => {
                    this.protocol.writeUInt8(value, this.offset)
                    this.offset++;
                })
                return {
                    success: true,
                    msg: `${key}成功写入协议`
                }
            } catch (error) {
                throw (error)
            }
        } else {
            return {
                success: false,
                msg: `${key}写入协议出错`
            }
        }
    }

    checkOutRange(buffer, length) {
        if (length > buffer.length) {
            throw ('Buffer RangeError: Index out of range');
        }
    }

}

module.exports = Protocol;