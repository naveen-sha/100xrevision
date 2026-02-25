// promisise

/*console.log("Start");

setTimeout(() => {
  console.log("Done");
}, 5000);

console.log("End");*/
const myPromise = new Promise((resolve, reject) => {

  let success = true;

  if (success) {
    resolve("Task completed");
  } else {
    reject("Task failed");
  }

});
myPromise.then((message)=>{
    console.log(message);
})