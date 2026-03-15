// promisise

/*console.log("Start");

setTimeout(() => {
  console.log("Done");
}, 5000);

console.log("End");*/
/*const myPromise = new Promise((resolve, reject) => {

  let success = true;

  if (success) {
    resolve("Task completed");
  } else {
    reject("Task failed");
  }

});
myPromise.then((message)=>{
    console.log(message);
});
*/
// microtask and macrotask

/*console.log("Start");

Promise.resolve().then(() => {
  console.log("Promise");
});

console.log("End");

// microtask always run before macrotask, even if the macrotask is scheduled before the microtask.
console.log("Start");

setTimeout(() => {
  console.log("Timeout");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise");
});

console.log("End");

// dom
function changeText() {
  document.getElementById("title").innerText = "You clicked the button!";
}*/

