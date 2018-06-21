const classType = {};

const allType = "Boolean Number String Function Array Uint8Array Date RegExp Object Error";

allType.split(" ").map((name, index) => {
    classType["[object " + name + "]"] = name.toLowerCase();
})

function type(obj) {
    //首先如果是null则返回null字符串
    if (obj == null) {
        return obj + "";
    }

    return typeof obj === 'object' || typeof obj === 'function' ? classType[toString.call(obj)] || 'object' : typeof obj;
}

module.exports = type;