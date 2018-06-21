const inspect = require('util').inspect
const path = require('path')
const fs = require('fs')
const Busboy = require('busboy')
const uploadConfig = require('../config').upload
const http = require('http');

/**
 * 同步创建文件目录
 * @param  {string} dirname 目录绝对地址
 * @return {boolean}        创建目录结果
 */
function mkdirsSync(dirname) {
  console.log(dirname)
  console.log(path.dirname(dirname))
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

/**
 * 获取上传文件的后缀名
 * @param  {string} fileName 获取上传文件的后缀名
 * @return {string}          文件后缀名
 */
function getSuffixName(fileName) {
  let nameList = fileName.split('.')
  return nameList[nameList.length - 1]
}

/**
 * 上传文件
 * @param  {object} ctx     koa上下文
 * @param  {object} options 文件上传参数 fileType文件类型， path文件存放路径
 * @return {promise}         
 */
function uploadFile(req, options) {
  let busboy = new Busboy({
    headers: req.headers
  })

  // 获取类型
  let fileType = options.fileType || 'common'
  let filePath = path.join(options.path, fileType)
  console.log(filePath)
  console.log(path.dirname(filePath))
  let mkdirResult = mkdirsSync(filePath)

  return new Promise((resolve, reject) => {
    console.log('文件上传中...')
    let result = {
      success: false,
      formData: {},
    }

    // 解析请求文件事件
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      let fileName = Math.random().toString(16).substr(2) + '.' + getSuffixName(filename)
      let _uploadFilePath = path.join(filePath, fileName)
      let saveTo = path.join(_uploadFilePath)

      // 文件保存到制定路径
      file.pipe(fs.createWriteStream(saveTo))

      // 文件写入事件结束
      file.on('end', function () {
        result.success = true
        result.path = path.relative(path.join(path.dirname(__dirname), '/public'), saveTo).replace(/\\/g, '\/');
        result.filename = filename
        result.message = '文件上传成功'
        console.log('文件上传成功！')
      })
    })

    // 解析表单中其他字段信息
    busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      console.log('表单字段数据 [' + fieldname + ']: value: ' + inspect(val));
      ((fieldname, val, result) => {
        try {
          result.formData[fieldname] = JSON.parse(val);
          console.log(JSON.parse(val))
        } catch (error) {
          try {
            result.formData[fieldname] = eval(val)
          } catch (error) {
            result.formData[fieldname] = val
          }
        }
      })(fieldname, val, result)
    });

    // 解析结束事件
    busboy.on('finish', function () {
      console.log('文件上结束')
      resolve(result)
    })

    // 解析错误事件
    busboy.on('error', function (err) {
      console.log('文件上出错')
      reject(result)
    })

    req.pipe(busboy)
  })

}

/**
 * 删除文件
 * 
 */
function deleteFile(filepath) {
  fs.unlink(path.join(path.dirname(__dirname), '/public/', filepath), (err) => {
    if (err) throw err;
    console.log(`成功删除 ${filepath}`);
  })
}

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    http.get(url, function (res) {
      var imgData = "", imgName = url.split('\/')[url.split('\/').length-1];
      let saveTo = uploadConfig.path + '/' + imgName
      res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
      res.on("data", function (chunk) {
        imgData += chunk;
      });
      res.on("end", function () {
        fs.writeFile(uploadConfig.path + '/' + imgName, imgData, "binary", function (err) {
          if (err) {
            reject('保存失败')
            console.log("保存失败");
          }
          imgName = path.relative(path.join(path.dirname(__dirname), '/public'), saveTo).replace(/\\/g, '\/');
          resolve(imgName)
          console.log("保存成功");
        });
      });
      res.on("error", function (err, reject) {
        reject('请求失败')
        console.log("请求失败");
      });
    });
  })
}

module.exports = {
  uploadFile,
  deleteFile,
  downloadFile
}