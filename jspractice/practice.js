let arr={ food: [10, 20, 30], travel: [5, 15], bills: [40, 60] }
let totalExpenses = 0;

for (let category in arr) {
  for (let i = 0; i < arr[category].length; i++) {
    totalExpenses += arr[category][i];
  }
}
console.log("Total Expenses: " + totalExpenses);
// Output: Total Expenses: 180