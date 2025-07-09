// import { useState, useEffect } from "react";
import { useEffect, useState } from "react";

interface MyCustomObject {
  name: string;
  fdf: string;
}

const Home = () => {
  //   const [quantity1, setQuantity1] = useState<number | null>(null);
  // const [quantity2, setQuantity2] = useState<number | null>(null);
    // примитивні типи даних
    
const age: number = 20;
const totalPrice: number = 200.74
const name: string = "John"
// const isOpen: boolean =  true;
let message : string | number = "мвоавлва";
message = "Hello world 2222"

const array: string[] = ["Hello", "Yes", "No"]
const object: MyCustomObject = {name: "hgjggk", fdf: "4"}

// приклда 1
const elementWidth: string = "100px"
const result: number = Number(parseInt(elementWidth))

const elementHeight: string = "200.5px"
const result2: number = Number(parseFloat(elementHeight))

const salary: number = 130.1234
const result3 = Number(salary.toFixed(2))

const message2: string = "Привіт я принц Абдуалла, мені 20 років"
const world: string = "принц"

// приклад 2
// useEffect(() => {
//      const rawQuantity1 = prompt("Введіть першу кількість товару");
//       if (rawQuantity1 !== null && rawQuantity1.trim() !== '') {
//       setQuantity1(Number(rawQuantity1));
//     } else {
//       alert("Першу кількість не введено або скасовано!");
//     }

//      // Запит другої кількості
//     const rawQuantity2 = prompt("Введіть другу кількість товару");
//     if (rawQuantity2 !== null && rawQuantity2.trim() !== '') {
//       setQuantity2(Number(rawQuantity2));
//     } else {
//       alert("Другу кількість не введено або скасовано!");
//     }
// }, [])

// const safeQuantity1 = quantity1 ?? 0; // Якщо quantity1 null, використовуй 0
//   const safeQuantity2 = quantity2 ?? 0; // Якщо quantity2 null, використовуй 0

//   const totalQuantity: number = safeQuantity1 + safeQuantity2;
const colors:string[] = ["red", "green", "blue", "yellow", "purple"]

const [color, setColor] = useState<string>(() => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  });

   // Функція для зміни кольору по натисканню кнопки
  const changeBackgroundColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    const newColor = colors[randomIndex];
    setColor(newColor); // ✅ Просто передаємо нове значення в setColor
  };
  

useEffect(() => {
  document.body.style.backgroundColor = color;

  return () => {
    document.body.style.backgroundColor = ""; // Очистка кольору при розмонтуванні
  }
},[color])

if(age < 18) {
  console.log("Він ще дитина бо йому лише:", age , "років");
}



const [ageMessage, setAgeMessage] = useState<string>("");
const handleAge = (checkThisAge: number) => {
  let msg: string = "";

switch (checkThisAge) {
  case 18:
    // console.log("Він вже дорослий, йому 18 років");
    msg = "Він вже дорослий, йому 18 років"
    break;
  case 20:
    // console.log("Він вже дорослий, йому 20 років");
    msg = "Він вже дорослий, йому 20 років";
    break;
  default:
    // console.log("Вік не визначено");
    msg = "Вік не визначено";
    break;
}
  setAgeMessage(msg);
}


    return ( <>
    {message2.includes(world) && <h1>Вітаю, ти знайшов слово {world}</h1>}
    <button onClick={() => handleAge(18)}> 18</button>
    <button onClick={() => handleAge(20)}>20</button>
    <button onClick={() => handleAge(age)}>Перевірити поточний вік ({age})</button>
    <p>{ageMessage}</p>

  
    <h1>Home page</h1>
    <h2>{name}</h2>
    <p>{age}</p>
    <p>{totalPrice}</p>
    <p>{age >= 10 ? age : "Мало років" }</p>
    <p>{message}</p>
    {array.map((item, index) => <p key={index} >{item}: {index}</p>)}
    <p>{object.name.toUpperCase()} : {`довжина слова ${object.name.length} букв`}</p>
    <p>{object.fdf}</p>
    {/* {quantity1 !== null && <h3>Перша кількість: {quantity1}</h3>}
      {quantity2 !== null && <p>Друга кількість: {quantity2}</p>}
       <h3>Загальна кількість: {totalQuantity}</h3> */}
       <p>{result}</p>
       <p>{result2}</p>
       <p>{result3}</p>
    <button onClick={changeBackgroundColor}>{color.toUpperCase()}</button>
    <p>{ age  >= 10 ? "Товар є в налічії" : "Закінчується"}</p>
    </> );
}
 
export default Home;