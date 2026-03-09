1. What is the difference between var, let, and const?

Ans:
- var is function scoped and can be re-declared anywhere, which can cause unexpected bugs.
- let is block scoped and can be reassigned but not re-declared in the same scope.
- const is block scoped and cannot be reassigned after declaration.
- Use const by default, only use let when you know the value will change, and avoid var.

```js
var a = 10;    // re-declarable, function scoped
let b = 20;    // reassignable, block scoped
const c = 30;  // fixed, block scoped
```


2. What is the spread operator (...)?

Ans: 
The spread operator unpacks the elements of an array or the properties of an object into a new one. It's useful when you want to copy or merge arrays and objects without mutating the original. It can also be used to pass array elements as individual arguments to a function.

```js
const a = [1, 2, 3];
const b = [...a, 4, 5]; // [1, 2, 3, 4, 5]
```



3. What is the difference between map(), filter(), and forEach()?

Ans:
- map transforms each element and returns a new array of the same length.
- filter checks each element against a condition and returns a new array with only the matching ones.
- forEach just loops through the array and returns nothing — used when you only want side effects like logging or updating the DOM.

```js
const nums = [1, 2, 3, 4];
nums.map(n => n * 2);         // [2, 4, 6, 8]
nums.filter(n => n > 2);      // [3, 4]
nums.forEach(n => console.log(n)); // 1 2 3 4
```

---

4. What is an arrow function?

Ans:
- An arrow function is a shorter syntax for writing functions using arrow (=>).
- The key difference from a regular function is that arrow functions don't have their own this.
- They inherit this from the surrounding scope, which makes them reliable to use inside callbacks and event handlers.

```js
const add = (a, b) => a + b;
```

---

5. What are template literals?

Ans:
- Template literals use backticks ( ` ) instead of quotes.
- They let you embed variables or expressions directly inside a string using  ${}.
- They also support multi-line strings natively so you no longer need \n to break lines.

```js
const name = "Rahim";
console.log(`Hello, ${name}!`); // Hello, Rahim!
```