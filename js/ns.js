// getter and setter
const student = {
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
console.log(student.getClass);