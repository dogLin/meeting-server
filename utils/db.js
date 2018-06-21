const moment = require('moment');
const differenceBy = require('lodash/differenceBy')

function queryEqual(query, condition) {
    let {
        field,
        value
    } = condition;
    return query.where(field, value)
}

function queryIn(query, condition) {
    let {
        field,
        value
    } = condition;
    return query.where(field).in(value)
}

function qureyInArray(query, condition) {
    let {
        field,
        subField,
        subValue
    } = condition;
    return query.where(field).elemMatch((elem) => {
        elem.where(subField).equals(subValue)
    })
}

function queryInRange(query, condition) {
    let {
        start,
        end
    } = condition;
    if (start && !end) {
        let {
            field,
            value,
            equal
        } = start;
        return equal ? query.gte(field, value) : query.gt(field, value)
    } else if (!start && end) {
        let {
            field,
            value,
            equal
        } = end;
        return equal ? query.lte(field, value) : query.lt(field, value)
    } else if (start && end) {
        let {
            start: {
                field: startField,
                value: startValue,
                equal: startEqual
            },
            end: {
                field: endField,
                value: endValue,
                equal: endEqual
            }
        } = condition;
        let startG, startL, endG, endL;
        if (startEqual) {
            startG = '$gte', startL = '$lte'
        } else {
            startG = '$gt', startL = '$lt'
        }
        if (endEqual) {
            endG = '$gte', endL = '$lte'
        } else {
            endG = '$gt', endL = '$lt'
        }
        endEqual = endEqual ? '$gte' : '$gt'
        return query = query.or([{
                [startField]: {
                    [startG]: startValue,
                    [startL]: endValue
                }
            },
            {
                [endField]: {
                    [endG]: startValue,
                    [endL]: endValue
                }
            }
        ])
    } else return query
}

function updateDoc(doc, newDoc){
    for (var prop in newDoc) {
        if(!isEqualWith(newDoc[prop], doc[prop])){
            if(isDate(doc[prop])){
                newDoc[prop] = moment(newDoc[prop]).toDate();
            }
            if(isArray(doc[prop]) && isArray(newDoc[prop])){
                let leftArr = differenceBy(doc[prop], newDoc[prop], compareField);
            }
            doc[prop] = newDoc[prop];
        }
    }
}

function arrayCompare(array, values, compareField){
    let leftArr = differenceBy(array, values, compareField);
    let rightArr = differenceBy(values, array, compareField);
    let centerArr = differenceBy(values, leftArr, compareField);
}

async function checkExist(model, field) {
    let {key, value} = field;
    try {
        let res = await model.where(key, value)
        if(res.length>0){
            return true
        }else{
            return false
        }
    } catch (error) {
        throw(error)
    }
}

module.exports = {
    queryEqual,
    qureyInArray,
    queryInRange,
    queryIn,
    checkExist
}