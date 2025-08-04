import React, { useState, useEffect } from "react"; // Імпортуємо основні хуки React: useState для стану та useEffect для побічних ефектів.

// Опис інтерфейсу для структури одного продукту.
interface Product {
  id: string; // Унікальний ідентифікатор товару (наприклад, 'apple').
  name: string; // Назва товару (наприклад, 'Яблуко').
  price: number; // Ціна товару за одиницю (наприклад, 50).
  icon: string; // Емодзі або іконка, що відображає товар (наприклад, '🍎').
}

// Опис інтерфейсу для структури одного магазину.
interface Shop {
  id: string; // Унікальний ідентифікатор магазину (наприклад, 'shop1').
  name: string; // Назва магазину (наприклад, 'Фруктовий Рай').
  products: Product[]; // Масив товарів, доступних у цьому магазині.
}

// Константа, що містить інформацію про всі доступні магазини та їхні товари.
const shops: Shop[] = [
  {
    id: "shop1",
    name: "Фрукти",
    products: [
      { id: "apple", name: "Яблуко", price: 50, icon: "🍎" },
      { id: "banana", name: "Банан", price: 70, icon: "🍌" },
      { id: "orange", name: "Апельсин", price: 60, icon: "🍊" },
      { id: "grape", name: "Виноград", price: 120, icon: "🍇" },
      { id: "lemon", name: "Лимон", price: 40, icon: "🍋" },
    ],
  },
  {
    id: "shop2",
    name: "Овочі",
    products: [
      { id: "carrot", name: "Морква", price: 30, icon: "🥕" },
      { id: "potato", name: "Картопля", price: 25, icon: "🥔" },
      { id: "tomato", name: "Помідор", price: 80, icon: "🍅" },
      { id: "cucumber", name: "Огірок", price: 55, icon: "🥒" },
      { id: "onion", name: "Цибуля", price: 20, icon: "🧅" },
    ],
  },
  {
    id: "shop3",
    name: "Бакалія",
    products: [
      { id: "bread", name: "Хліб", price: 35, icon: "🍞" },
      { id: "milk", name: "Молоко", price: 45, icon: "🥛" },
      { id: "eggs", name: "Яйця", price: 75, icon: "🥚" },
      { id: "cheese", name: "Сир", price: 150, icon: "🧀" },
      { id: "butter", name: "Масло", price: 90, icon: "🧈" },
    ],
  },
];

// Опис інтерфейсу для елемента в історії покупок.
interface PurchaseItem {
  id: string; // Унікальний ID для запису в історії (генерується при покупці).
  name: string; // Назва придбаного товару.
  icon: string; // Іконка придбаного товару.
  quantity: number; // Кількість придбаного товару.
  totalItemPrice: number; // Загальна вартість цієї позиції (ціна за шт. * кількість).
  timestamp: string; // Час здійснення покупки (форматований рядок).
  unitPrice: number; // Ціна за одиницю товару на момент покупки.
  shopName: string; // Назва магазину, де було придбано товар.
}

// Головний функціональний компонент програми.
function Home() {
  // Стан для зберігання значення з поля вводу для поповнення балансу (тимчасове, як рядок).
  const [initialBalanceInput, setInitialBalanceInput] = useState<string>("");

  // Стан для поточного балансу гаманця.
  // Ініціалізується з LocalStorage або 0, якщо даних немає або сталася помилка.
  const [balance, setBalance] = useState<number>(() => {
    try {
      const savedBalance = localStorage.getItem("walletBalance");
      // Якщо в LocalStorage є збережений баланс, парсимо його; інакше, встановлюємо 0.
      return savedBalance ? parseFloat(savedBalance) : 0;
    } catch (error) {
      console.error("Помилка при зчитуванні балансу з LocalStorage:", error);
      return 0; // Повертаємо 0 у випадку помилки.
    }
  });

  // Стан для лічильника зроблених покупок (не зберігається в LocalStorage, лише для відображення сесії).
  const [purchaseCount, setPurchaseCount] = useState<number>(0);

  // Стан для зберігання кількості кожного вибраного товару перед покупкою.
  // Ключ: ID товару, Значення: вибрана кількість.
  const [selectedQuantities, setSelectedQuantities] = useState<
    Record<string, number>
  >({});

  // Стан для ID поточного активного магазину (за замовчуванням - ID першого магазину).
  const [activeShopId, setActiveShopId] = useState<string>(shops[0].id);
  // Знаходимо об'єкт активного магазину з масиву `shops` за його ID.
  const activeShop = shops.find((shop) => shop.id === activeShopId);

  // Стан для масиву історії покупок.
  // Ініціалізується з LocalStorage або порожнім масивом, якщо даних немає/помилка.
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem("purchaseHistory");
      // Якщо в LocalStorage є збережена історія, парсимо її з JSON; інакше, порожній масив.
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error(
        "Помилка при зчитуванні історії покупок з LocalStorage:",
        error
      );
      return []; // Повертаємо порожній масив у випадку помилки.
    }
  });

  // Стан, який відстежує, чи є значущі дані В ІСТОРІЇ покупок у LocalStorage.
  // Цей стан буде true, тільки якщо `purchaseHistory` у LocalStorage НЕ порожній.
  const [hasLocalStorageData, setHasLocalStorageData] =
    useState<boolean>(false);

  // **НОВА/ОНОВЛЕНА ФУНКЦІЯ:** Перевіряє, чи є значущі дані в LocalStorage.
  // Ця версія сфокусована лише на `purchaseHistory`.
  const checkLocalStorageData = () => {
    try {
      const savedHistory = localStorage.getItem("purchaseHistory");
      let currentHistory: PurchaseItem[] = [];
      // Намагаємося розпарсити збережену історію. Якщо є помилка або дані відсутні, вважаємо її порожньою.
      if (savedHistory) {
        try {
          currentHistory = JSON.parse(savedHistory);
        } catch (e) {
          console.error("Помилка при парсингу збереженої історії:", e);
          currentHistory = [];
        }
      }
      // Повертаємо true, якщо довжина історії покупок більше 0.
      return currentHistory.length > 0;
    } catch (error) {
      console.error("Помилка при перевірці даних LocalStorage:", error);
      return false; // У випадку будь-якої помилки припускаємо, що значущих даних немає.
    }
  };

  // **НОВИЙ useEffect:** Запускається лише один раз при монтуванні компонента.
  // Його завдання - ініціалізувати стан `hasLocalStorageData` на основі поточної історії покупок.
  useEffect(() => {
    setHasLocalStorageData(checkLocalStorageData());
  }, []); // Пустий масив залежностей означає, що ефект запускається тільки один раз при завантаженні.

  // **ОНОВЛЕНИЙ useEffect:** Зберігає баланс у LocalStorage щоразу, коли він змінюється.
  // Важливо: Цей ефект БІЛЬШЕ НЕ ВПЛИВАЄ на `hasLocalStorageData`, оскільки кнопка залежить лише від історії покупок.
  useEffect(() => {
    localStorage.setItem("walletBalance", balance.toString());
    // setHasLocalStorageData(checkLocalStorageData()); // Цей рядок було ВИДАЛЕНО!
  }, [balance]); // Ефект запускається щоразу, коли змінюється значення `balance`.

  // **ОНОВЛЕНИЙ useEffect:** Зберігає історію покупок у LocalStorage щоразу, коли вона змінюється.
  // Цей ефект також оновлює стан `hasLocalStorageData`, оскільки кнопка залежить від історії.
  useEffect(() => {
    localStorage.setItem("purchaseHistory", JSON.stringify(purchaseHistory));
    setHasLocalStorageData(checkLocalStorageData()); // Оновлюємо стан наявності даних в історії.
  }, [purchaseHistory]); // Ефект запускається щоразу, коли змінюється `purchaseHistory`.

  // useEffect, який спрацьовує при зміні активного магазину.
  // Очищає вибрані кількості товарів при перемиканні магазину.
  useEffect(() => {
    if (activeShop) {
      setSelectedQuantities({}); // Очищаємо всі вибрані кількості товарів.
    }
  }, [activeShopId]); // Ефект запускається щоразу, коли змінюється `activeShopId`.

  // Парсимо вхідне значення поповнення балансу в число з плаваючою комою.
  const parsedInitialBalance: number = parseFloat(initialBalanceInput);

  // Функція для розрахунку загальної вартості вибраних товарів.
  const calculateTotalSelectedPrice = (): number => {
    let total = 0;
    // Перебираємо всі товари, для яких вибрана кількість.
    for (const productId in selectedQuantities) {
      const quantity = selectedQuantities[productId]; // Отримуємо кількість.
      // Знаходимо товар у списку товарів активного магазину за його ID.
      const product = activeShop?.products.find((p) => p.id === productId);
      // Якщо товар знайдено і кількість більша за 0, додаємо до загальної суми.
      if (product && quantity > 0) {
        total += product.price * quantity;
      }
    }
    return total; // Повертаємо загальну вартість.
  };

  // Змінна, що зберігає загальну суму до сплати за вибрані товари.
  const paymentAmount: number = calculateTotalSelectedPrice();

  // Обробник зміни значення в полі вводу для поповнення балансу.
  const handleInitialBalanceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInitialBalanceInput(event.target.value); // Оновлюємо стан `initialBalanceInput`.
  };

  // Обробник для кнопки "Поповнити Баланс".
  const setCustomBalance = () => {
    // Перевіряємо, чи введено дійсне додатне число.
    if (isNaN(parsedInitialBalance) || parsedInitialBalance < 0) {
      alert("Будь ласка, введіть дійсне додатне число для поповнення балансу.");
      return; // Виходимо з функції.
    }
    // Оновлюємо баланс, додаючи введену суму.
    setBalance((prevBalance) => prevBalance + parsedInitialBalance);
    setInitialBalanceInput(""); // Очищаємо поле вводу.
  };

  // Обробник зміни кількості товару (додавання або віднімання).
  const handleQuantityChange = (productId: string, change: number) => {
    // Оновлюємо стан `selectedQuantities` безпечним способом (функціональне оновлення).
    setSelectedQuantities((prevQuantities) => {
      const newQuantities = { ...prevQuantities }; // Створюємо копію попереднього об'єкта.
      const currentQty = newQuantities[productId] || 0; // Поточна кількість товару або 0.

      if (change > 0) {
        // Якщо додаємо товар.
        newQuantities[productId] = currentQty + change;
      } else if (change < 0) {
        // Якщо віднімаємо товар.
        if (currentQty + change <= 0) {
          // Якщо кількість стає 0 або менше, видаляємо товар.
          delete newQuantities[productId];
        } else {
          // Інакше, просто зменшуємо кількість.
          newQuantities[productId] = currentQty + change;
        }
      }
      return newQuantities; // Повертаємо оновлений об'єкт.
    });
  };

  // Обробник для кнопки "Здійснити покупку".
  const handlePayment = () => {
    // Перевіряємо, чи вибрано хоча б один товар.
    if (paymentAmount === 0) {
      alert("Будь ласка, виберіть товари для покупки.");
      return;
    }

    // Перевіряємо, чи достатньо коштів на балансі.
    if (balance >= paymentAmount) {
      setBalance((prevBalance) => prevBalance - paymentAmount); // Зменшуємо баланс.
      setPurchaseCount((prevCount) => prevCount + 1); // Збільшуємо лічильник покупок.

      const newPurchaseEntries: PurchaseItem[] = []; // Масив для нових записів історії.
      // Проходимо по всіх вибраних товарах.
      for (const productId in selectedQuantities) {
        const quantity = selectedQuantities[productId];
        const product = activeShop?.products.find((p) => p.id === productId);
        if (product && quantity > 0) {
          // Додаємо новий запис про покупку.
          newPurchaseEntries.push({
            id: `${product.id}-${Date.now()}-${Math.random()}`, // Унікальний ID.
            name: product.name,
            icon: product.icon,
            unitPrice: product.price,
            quantity: quantity,
            totalItemPrice: product.price * quantity,
            timestamp: new Date().toLocaleString(), // Поточний час.
            shopName: activeShop?.name || "Невідомий магазин",
          });
        }
      }

      // Оновлюємо історію покупок, додаючи нові записи на початок масиву.
      setPurchaseHistory((prevHistory) => [
        ...newPurchaseEntries,
        ...prevHistory,
      ]);
      setSelectedQuantities({}); // Очищаємо всі вибрані товари після успішної покупки.
    } else {
      // Повідомлення про недостатність коштів.
      alert(
        `Недостатньо коштів на рахунку! Потрібно ${paymentAmount} грн, а у вас ${balance} грн.`
      );
    }
  };

  // Обробник зміни вибраного магазину.
  const handleShopChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveShopId(event.target.value); // Оновлюємо ID активного магазину.
  };

  // **НОВА ФУНКЦІЯ:** Очищення всіх даних з LocalStorage.
  const clearAllLocalStorageData = () => {
    // Запитуємо підтвердження у користувача перед видаленням.
    if (
      window.confirm(
        "Ви впевнені, що хочете видалити всі дані (баланс та історію покупок) з LocalStorage? Цю дію не можна скасувати."
      )
    ) {
      localStorage.removeItem("walletBalance"); // Видаляємо баланс.
      localStorage.removeItem("purchaseHistory"); // Видаляємо історію.
      setBalance(0); // Скидаємо баланс у стані React.
      setPurchaseHistory([]); // Скидаємо історію у стані React.
      setPurchaseCount(0); // Скидаємо лічильник покупок.
      setSelectedQuantities({}); // Очищаємо вибрані товари.
      setHasLocalStorageData(false); // **ВАЖЛИВО:** Встановлюємо `false` після очищення, щоб кнопка зникла.
      alert("Всі дані LocalStorage були видалені."); // Повідомлення про успішне видалення.
    }
  };

  // Логіка для вимкнення кнопки поповнення балансу.
  const isSetBalanceButtonDisabled: boolean =
    isNaN(parsedInitialBalance) || parsedInitialBalance < 0;
  // Логіка для вимкнення кнопки покупки.
  const isPurchaseButtonDisabled: boolean =
    paymentAmount === 0 || balance < paymentAmount || balance === 0;

  // Відображення повідомлення, якщо активний магазин ще не завантажився (малоймовірно).
  if (!activeShop) {
    return <div>Завантаження магазину...</div>;
  }

  return (
    <>
      <h1>Управління Балансом</h1>

      <div>
        <label htmlFor="initialBalance">
          Введіть суму для поповнення балансу:
        </label>
        <input
          type="number"
          id="initialBalance"
          value={initialBalanceInput}
          onChange={handleInitialBalanceChange}
          min="0"
          step="any"
          placeholder="Наприклад, 5000"
        />
        <button
          onClick={setCustomBalance}
          disabled={isSetBalanceButtonDisabled}
        >
          Поповнити Баланс
        </button>
      </div>

      <hr />

      <h2>Ваш Баланс: {balance} грн</h2>
      <h3>Кількість зроблених покупок: {purchaseCount}</h3>
      <h3>Загальна сума вибраних товарів: {paymentAmount} грн</h3>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="shop-select" style={{ marginRight: "10px" }}>
          Оберіть магазин:
        </label>
        <select
          id="shop-select"
          value={activeShopId}
          onChange={handleShopChange}
        >
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.name}
            </option>
          ))}
        </select>
      </div>

      <h3>Товари магазину "{activeShop.name}":</h3>
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "20px",
          justifyContent: "center",
        }}
      >
        {activeShop.products.map((product) => {
          const currentQuantity = selectedQuantities[product.id] || 0;
          return (
            <div
              key={product.id}
              style={{
                cursor: "pointer",
                border: `2px solid ${currentQuantity > 0 ? "blue" : "#ccc"}`,
                borderRadius: "8px",
                padding: "10px 15px",
                textAlign: "center",
                backgroundColor: currentQuantity > 0 ? "#e6f7ff" : "#f9f9f9",
                boxShadow:
                  currentQuantity > 0 ? "0 0 8px rgba(0, 0, 255, 0.3)" : "none",
                transition: "all 0.2s ease-in-out",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "2em" }}>{product.icon}</span>
              <p style={{ margin: "5px 0 0 0", fontWeight: "bold" }}>
                {product.name}
              </p>
              <p style={{ margin: "0", color: "#555" }}>
                {product.price} грн/шт.
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "10px",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(product.id, -1);
                  }}
                  disabled={currentQuantity === 0}
                  style={{
                    fontSize: "1.2em",
                    padding: "5px 10px",
                    margin: "0 5px",
                  }}
                >
                  -
                </button>
                <span style={{ fontSize: "1.2em", fontWeight: "bold" }}>
                  {currentQuantity}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(product.id, 1);
                  }}
                  style={{
                    fontSize: "1.2em",
                    padding: "5px 10px",
                    margin: "0 5px",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={handlePayment} disabled={isPurchaseButtonDisabled}>
        Здійснити покупку
      </button>

      {/* Умовні повідомлення для користувача */}
      {balance === 0 &&
      purchaseCount === 0 &&
      parsedInitialBalance === 0 &&
      paymentAmount === 0 ? (
        <p style={{ color: "blue" }}>
          Будь ласка, поповніть баланс, щоб почати покупки.
        </p>
      ) : balance === 0 && purchaseCount > 0 && paymentAmount === 0 ? (
        <p style={{ color: "red" }}>
          На рахунку немає коштів! Покупки більше неможливі.
        </p>
      ) : paymentAmount > balance && balance > 0 ? (
        <p style={{ color: "orange" }}>
          Загальна сума вибраних товарів ({paymentAmount} грн) перевищує
          доступний баланс.
        </p>
      ) : paymentAmount === 0 && balance > 0 ? (
        <p>Будь ласка, виберіть товари для покупки.</p>
      ) : (
        <p>Натисніть кнопку "Здійснити покупку" для підтвердження.</p>
      )}

      {/* Секція ІСТОРІЇ ПОКУПОК */}
      {purchaseHistory.length > 0 && ( // Відображаємо історію лише якщо вона не порожня.
        <>
          <hr />
          <h2>Історія Покупок</h2>
          <table
            style={{
              width: "100%",
              tableLayout: "fixed",
              borderCollapse: "collapse",
              marginTop: "10px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <thead>
              <tr style={{ background: "#f2f2f2" }}>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Час
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Магазин
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Товар
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Іконка
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                >
                  Кількість
                </th>
                <th
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    textAlign: "right",
                  }}
                >
                  Ціна за шт. (грн)
                </th>
              </tr>
            </thead>
            <tbody>
              {purchaseHistory.map((item, index) => (
                <tr
                  key={item.id}
                  style={{ background: index % 2 === 0 ? "#fff" : "#f9f9f9" }}
                >
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {item.timestamp}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {item.shopName}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {item.name}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      fontSize: "1.2em",
                    }}
                  >
                    {item.icon}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      textAlign: "right",
                    }}
                  >
                    {item.unitPrice}
                  </td>
                  {/* <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    {item.totalItemPrice}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <hr />
      {/* УМОВНЕ ВІДОБРАЖЕННЯ КНОПКИ: 
          Кнопка "Видалити все з LocalStorage" відображається лише тоді, 
          коли `hasLocalStorageData` є `true` (що означає, що є записи в історії покупок). */}
      {hasLocalStorageData && (
        <button
          onClick={clearAllLocalStorageData}
          style={{
            backgroundColor: "#dc3545", // Червоний колір фону.
            color: "white", // Білий колір тексту.
            padding: "10px 20px", // Відступи всередині кнопки.
            border: "none", // Без рамки.
            borderRadius: "5px", // Заокруглені кути.
            cursor: "pointer", // Курсор-покажчик при наведенні.
            marginTop: "20px", // Відступ зверху.
          }}
        >
          Видалити все з LocalStorage
        </button>
      )}
    </>
  );
}

export default Home;
