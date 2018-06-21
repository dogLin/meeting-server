const constant = require('../utils/constant_protocol')

function defineMessages(obj){
  for (let prop in obj){
      if(key = Object.keys(constant).find(key => key==obj[prop].id)){
          obj[prop] = constant[key]
      }
      else {
        obj[prop] = obj[prop].default
      }
  }

  return obj
}

module.exports = defineMessages