// getter and setter
/*const student = {
  name: "Naveen",
  class:"10th",

  get getName() {
    return this.name;
  },

  get getClass() {
    return this.class;
  }
};

console.log(student.getName);
console.log(student.getClass);*/
/* const student = {
  name: "",

  set setName(value) {
    this.name = value;
  }
};

student.setName = "Naveen";

console.log(student.name);
*/
/*const student = {
  name: "",

  set setName(value) {
    this.name = value;
  }
};

student.setName = "Naveen";

console.log(student.name);*/
/*et async = (nim,nis) => {
  console.log("Hello " + nim + " " + nis);


}

async("Naveen", "10th class");
if(async){
  console.log("Async function is defined");
}else{
  console.log("Async function is not defined");
}

*/
// currying
// Convert function with multiple arguments into chained functions.
/*function add(a) {
  return function(b) {
    return a + b;
  };
}

add(2)(3); // 5*/

/* console.log(Math.random());
let num= Math.random();
if(num < 0.5){
  console.log("Number is less than 0.5");
}
*/

// arrays
let arr = [1, 2, 3, 4, 5];
let array= new Array(1, 2, 3, 4, 5);
type=typeof arr;
arr.push(6);
if(type === "object"){
  console.log("Array is an object",arr);
}else{
  console.log("Array is not an object",arr);
}               


