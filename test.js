const delay = timeout => new Promise(resolve=> setTimeout(resolve, timeout));
async function f(done){
    await delay(1000);
    await delay(2000);
    await delay(3000);
    return done;
}

async function f1(done) {
    return await new Promise((res, rej)=>{
        setTimeout(()=>{
            console.log(done)
            res(done)
        },3000)
    })
}

async function g(){
    let promiseArr = [11,22,33];
   /* promiseArr.push(f1(11))
    promiseArr.push(f1(22))
    promiseArr.push(f1(33))*/

    for(var i=0; i<promiseArr.length; i++){
        await f1(promiseArr[i])
    }

/*    promiseArr.forEach(async (value, index)=>{
        console.log(await value)
    })*/

    /*for(let pro of promiseArr){
        await pro
    }*/

}


g()

const users = { // 定义3个人,且每个人睡觉时间是1
  leo: {
    name: 'leo',
    sleep: 1
  },
  mick: {
    name: 'mick',
    sleep: 1
  },
  jack: {
    name: 'jack',
    sleep: 1
  }
}
async function sleep(name, sleep) { // 碎觉函数,包括打印当前碎觉时间,和累加未碎觉人的时间
  await new Promise((reslove) => {
    setTimeout(() => {
      console.log(`${name} sleep ${sleep}`);
      Object.keys(users).forEach(u => {
        if (name !== u) {
          users[u].sleep += sleep;
        }
      })
      reslove();
    }, sleep * 1000);
  })
}
async function consoleSleep(names) {
  for(let i = 0; i < names.length; i++) {
    await sleep(users[names[i]].name, users[names[i]].sleep)
  }
}
consoleSleep(['leo', 'mick', 'jack'])