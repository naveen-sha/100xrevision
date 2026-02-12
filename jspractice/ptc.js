// functionnnnnnnnnnnnnnnnnnnnnnnnn
//.................................................
// findsum.
/* function findsum(num1,num2){
    let sum =num1+num2;
    return sum;

}
let sum=findsum("5","9");
console.log(sum);*/ 
//...............................................................
// canvote or not..
/*function canvote(age){
    if(age>=18){
        return "Yes you can vote";
    }else{
        return "No you are not able to vote"
    }
}
let vote=canvote("3");
console.log(vote);
*/
//..............................................................
//check the no.mis even or odd
/* function checknumber(num){
    if(num%2==0){
        return "the number is even";
    }else{
        return "the numebr is odd";
    }

}
let number=checknumber(59);
console.log(number);*/
//..............................
//findsum from 1to n numbers;
/*function findsum(n){
    let sum=0;
    for(let i=1;i<=n;i++){
        sum=sum+i;
    }
return sum;
}
console.log(findsum(8));
*/
//............................................
//objects
/* let data={
    name:"naveen",
    age:17,
    rollnumber:24005080034,
    height:"176cm",
    weight:"71kg"
}
console.log(data);*/
//....................................
//Write a function that takes a user as an input and greets them with their name and age.
fetch("https://jsonplaceholder.typicode.com/users/1")
  .then(response => response.json())   // convert to JSON
  .then(data => console.log(data))     // use the data
  .catch(error => console.log(error)); // handle error

