import React, { useState } from 'react';

const products = [
  { id: 'apple', name: 'Яблуко', price: 50, icon: '🍎' },
  { id: 'banana', name: 'Банан', price: 70, icon: '🍌' },
  { id: 'orange', name: 'Апельсин', price: 60, icon: '🍊' },
  { id: 'grape', name: 'Виноград', price: 120, icon: '🍇' },
  { id: 'lemon', name: 'Лимон', price: 40, icon: '🍋' },
];

interface PurchaseItem {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  totalItemPrice: number;
  timestamp: string;
  unitPrice: number;
}

function Home() {
   const [initialBalanceInput, setInitialBalanceInput] = useState<string>('');
  const [balance, setBalance] = useState<number>(0); 
  const [purchaseCount, setPurchaseCount] = useState<number>(0);

  // ЗМІНА: Стан для зберігання кількості вибраних товарів.
  // Ключ: ID товару (string), Значення: Кількість (number)
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({}); 

  // ОНОВЛЕННЯ: Структура елемента історії покупок
  const [purchaseHistory, setPurchaseHistory] = useState<
    { id: string; name: string; icon: string; quantity: number; totalItemPrice: number; timestamp: string }[]
  >([]);

  const parsedInitialBalance: number = parseFloat(initialBalanceInput);

  // Розраховуємо загальну суму вибраних товарів
  const calculateTotalSelectedPrice = (): number => {
    let total = 0;
    // Перебираємо об'єкт selectedQuantities
    for (const productId in selectedQuantities) {
      const quantity = selectedQuantities[productId];
      const product = products.find(p => p.id === productId);
      // Додаємо до загальної суми: ціна товару * його кількість
      if (product && quantity > 0) { 
        total += product.price * quantity;
      }
    }
    return total;
  };

  const paymentAmount: number = calculateTotalSelectedPrice();

  // --- Обробники для поповнення балансу (без змін) ---
  const handleInitialBalanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInitialBalanceInput(event.target.value);
  };

  const setCustomBalance = () => {
    if (isNaN(parsedInitialBalance) || parsedInitialBalance < 0) {
      alert("Будь ласка, введіть дійсне додатне число для поповнення балансу.");
      return;
    }
    setBalance(prevBalance => prevBalance + parsedInitialBalance); 
    setInitialBalanceInput(''); 
  };
  // --- Кінець обробників для поповнення балансу ---

  // НОВИЙ ОБРОБНИК: Зміна кількості товару
  const handleQuantityChange = (productId: string, change: number) => {
    setSelectedQuantities(prevQuantities => {
      const newQuantities = { ...prevQuantities }; // Створюємо копію об'єкта стану

      const currentQty = newQuantities[productId] || 0; // Поточна кількість або 0

      if (change > 0) { // Додаємо кількість
        newQuantities[productId] = currentQty + change;
      } else if (change < 0) { // Віднімаємо кількість
        if (currentQty + change <= 0) { // Якщо кількість стає 0 або менше, видаляємо товар з вибору
          delete newQuantities[productId];
        } else { // Зменшуємо кількість
          newQuantities[productId] = currentQty + change;
        }
      }
      return newQuantities; // Повертаємо новий об'єкт для оновлення стану
    });
  };

  // ОНОВЛЕНИЙ ОБРОБНИК: handlePayment
  const handlePayment = () => {
    if (paymentAmount === 0) {
      alert("Будь ласка, виберіть товари для покупки.");
      return;
    }

    if (balance >= paymentAmount) {
      setBalance(prevBalance => prevBalance - paymentAmount);
      setPurchaseCount(prevCount => prevCount + 1);

      // Готуємо записи для історії покупок з урахуванням кількості
      const newPurchaseEntries: PurchaseItem[] = [];
      for (const productId in selectedQuantities) {
        const quantity = selectedQuantities[productId];
        const product = products.find(p => p.id === productId);
        if (product && quantity > 0) {
          newPurchaseEntries.push({
            id: `${product.id}-${Date.now()}-${Math.random()}`, // Унікальний ID для кожної позиції в історії
            name: product.name,
            icon: product.icon,
            unitPrice: product.price, // Ціна за одиницю
            quantity: quantity, // Кількість придбаного товару
            totalItemPrice: product.price * quantity, // Загальна ціна за цю кількість товару
            timestamp: new Date().toLocaleString()
          });
        }
      }
      
      setPurchaseHistory(prevHistory => [...newPurchaseEntries, ...prevHistory]); // Додаємо нові записи
      setSelectedQuantities({}); // Очищуємо вибрані товари після покупки
    } else {
      alert(`Недостатньо коштів на рахунку! Потрібно ${paymentAmount} грн, а у вас ${balance} грн.`);
    }
  };

  const isSetBalanceButtonDisabled: boolean = isNaN(parsedInitialBalance) || parsedInitialBalance < 0;

  // Логіка блокування кнопки "Здійснити покупку" (без змін, paymentAmount вже враховує кількість)
  const isPurchaseButtonDisabled: boolean = paymentAmount === 0 || balance < paymentAmount || balance === 0;

  return (
    <>
      <h1>Гаманець витрат</h1>

      <div>
        <label htmlFor="initialBalance">Введіть суму для поповнення балансу:</label>
        <input
          type="number"
          id="initialBalance"
          value={initialBalanceInput}
          onChange={handleInitialBalanceChange}
          min="0"
          step="any"
          placeholder="Наприклад, 5000"
        />
        <button onClick={setCustomBalance} disabled={isSetBalanceButtonDisabled}>
          Поповнити Баланс
        </button>
      </div>

      <hr />

      <h2>Ваш Баланс: {balance} грн</h2>
      <h3>Кількість зроблених покупок: {purchaseCount}</h3>
      <h3>Загальна сума вибраних товарів: {paymentAmount} грн</h3>

      <h3>Оберіть товари та їх кількість:</h3>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {products.map(product => {
          const currentQuantity = selectedQuantities[product.id] || 0; // Отримуємо поточну кількість для цього товару
          return (
            <div 
              key={product.id}
              // Клік на самому елементі може збільшувати кількість на 1, або керуватися лише кнопками
              // onClick={() => handleQuantityChange(product.id, 1)} // Можна додати для швидкого додавання
              style={{
                cursor: 'pointer',
                border: `2px solid ${currentQuantity > 0 ? 'blue' : '#ccc'}`, // Рамка, якщо кількість > 0
                borderRadius: '8px',
                padding: '10px 15px',
                textAlign: 'center',
                backgroundColor: currentQuantity > 0 ? '#e6f7ff' : '#f9f9f9',
                boxShadow: currentQuantity > 0 ? '0 0 8px rgba(0, 0, 255, 0.3)' : 'none',
                transition: 'all 0.2s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontSize: '2em' }}>{product.icon}</span>
              <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>{product.name}</p>
              <p style={{ margin: '0', color: '#555' }}>{product.price} грн/шт.</p>
              
              {/* Кнопки +1 / -1 та відображення кількості */}
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleQuantityChange(product.id, -1); }} // e.stopPropagation() щоб клік на кнопці не викликав клік на батьківському div
                  disabled={currentQuantity === 0} // Вимикаємо кнопку "-", якщо кількість 0
                  style={{ fontSize: '1.2em', padding: '5px 10px', margin: '0 5px' }}
                >
                  -
                </button>
                <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                  {currentQuantity}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleQuantityChange(product.id, 1); }}
                  style={{ fontSize: '1.2em', padding: '5px 10px', margin: '0 5px' }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handlePayment}
        disabled={isPurchaseButtonDisabled}
      >
        Здійснити покупку
      </button>

      {balance === 0 && purchaseCount === 0 && parsedInitialBalance === 0 && paymentAmount === 0 ? (
        <p style={{ color: 'blue' }}>Будь ласка, поповніть баланс, щоб почати покупки.</p>
      ) : balance === 0 && purchaseCount > 0 && paymentAmount === 0 ? (
        <p style={{ color: 'red' }}>На рахунку немає коштів! Покупки більше неможливі.</p>
      ) : paymentAmount > balance && balance > 0 ? (
        <p style={{ color: 'orange' }}>Загальна сума вибраних товарів ({paymentAmount} грн) перевищує доступний баланс.</p>
      ) : paymentAmount === 0 && balance > 0 ? (
        <p>Будь ласка, виберіть товари для покупки.</p>
      ) : (
        <p>Натисніть кнопку "Здійснити покупку" для підтвердження.</p>
      )}

      {/* Секція ІСТОРІЇ ПОКУПОК */}
      {purchaseHistory.length > 0 && (
        <>
          <hr />
          <h2>Історія Покупок</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Час</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Товар</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Іконка</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Кількість</th> {/* Нова колонка */}
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>Ціна за шт. (грн)</th> {/* Нова колонка */}
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>Загалом (грн)</th> {/* Нова колонка */}
              </tr>
            </thead>
            <tbody>
              {purchaseHistory.map((item, index) => (
                <tr key={item.id} style={{ background: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.timestamp}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.name}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '1.2em' }}>{item.icon}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{item.unitPrice}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>{item.totalItemPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}

export default Home;
