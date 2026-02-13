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
// this is fetching data from the api and showing in console.
/* fetch("https://jsonplaceholder.typicode.com/users/1")
  .then(response => response.json())   // convert to JSON
  .then(data => console.log(data))     // use the data
  .catch(error => console.log(error)); // handle error
*/

//practice questions of javascript array and objects.
//find even numbers from 1 to 10 and return them in an array.
/* function findevennumbers(arr){
    let numbers=[1,2,3,4,5,6,7,8,9,10];
    let evennumbers=[];
    for(let i=0;i<numbers.length;i++){
        if(numbers[i]%2!==0){
            evennumbers.push(numbers[i]);
        }

}
return evennumbers;
}
let even=findevennumbers();
console.log(even);
*/
//find the negative and positive numbers from an array and return them in separate arrays.
/*function findnegandpos(arr){
    let numbers=[-5,-3,0,2,4,6];
    let negativenumbers=[];
    let positivenumbers=[];
    for(let i=0;i<numbers.length;i++){
        if(numbers[i]<0){
            negativenumbers.push(numbers[i]);

        }else if(numbers[i]>0){
            positivenumbers.push(numbers[i]);
        }
    }
    return {negativenumbers,positivenumbers};
}
let result=findnegandpos();
console.log(result);*/
// find largest and smallest numbers from an array and return them as an object.
/* function findlargestandsmallest(arr){
    let numbers=[5,3,8,1,4];
    let largest=numbers[0];
    let smallest=numbers[0];
    for(let i=1;i<numbers.length;i++){
        if(numbers[i]>largest){
            largest=numbers[i];
        }else if(numbers[i]<smallest){
            smallest=numbers[i];
        }
    }
    return {largest,smallest};
}
let result=findlargestandsmallest();
console.log(result);
*/
//some functions things..........
/* function calculatearithmetic(num1,num2,type){
    if(type=="add"){
      const value=sum( num1,num2);
      return value;
    }
    if(type=="sub"){
        if(type=="sub"){
            const value=sub(num1,num2);
            return value;
        }

}   
}
function sum( num1,num2){
    return num1+num2;
}
function sub(num1,num2){
    return num1-num2;
}
let result=calculatearithmetic(5,3,"sub");
console.log(result);*/
//............................................................

//using callback functions.

/*function calculatearithmetic(num1,num2,finalsum,finalsub){
    const sum=finalsum(num1,num2);
    const sub=finalsub(num1,num2);
    return {sum,sub};

}
function sum( num1,num2){
    return num1+num2;
};
function sub(num1,num2){
    return num1-num2;   
}
let result=calculatearithmetic(9,6,sum,sub);
console.log(result);
//............................................................
//using settimeout function to delay the execution of a function by 2 seconds.
function greeting(name){
    console.log("Hello, "+name+"! Welcome to JavaScript programming.");
}

setTimeout(greeting,5 * 1000,"naveen");
//............................................................
//setinterval function to print the current time every second for 5 seconds.
 function printCurrentTime(){
    const now=new Date();
    console.log("Current time: "+now.toLocaleTimeString());
}
setInterval(printCurrentTime,5*1000);*/
//............................................................






