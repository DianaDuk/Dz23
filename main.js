const addFunction = require('./math');
console.log(addFunction(2, 1)); 

const http = require('http');
const fs = require('fs');
const path = require('path');

// Шлях до файлу data.txt
const dataFile = path.join(__dirname, 'data.txt');

// Ініціалізація файлу, якщо він не існує
const initializeFile = () => {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([]));
  }
};

// Читання даних з файлу
const readData = () => {
  const data = fs.readFileSync(dataFile, 'utf8');
  return JSON.parse(data);
};

// Запис даних у файл
const writeData = (data) => {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

// Ініціалізація файлу при запуску сервера
initializeFile();

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // Устанавливаем заголовки для JSON-ответов
  res.setHeader('Content-Type', 'application/json');

  // GET /items - Отримання всіх елементів з файлу
  if (method === 'GET' && url === '/items') {
    const items = readData();
    res.writeHead(200);
    res.end(JSON.stringify(items));

  // POST /items - Додавання нового елемента
  } else if (method === 'POST' && url === '/items') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { name } = JSON.parse(body);
      const items = readData();
      const newItem = { id: items.length ? items[items.length - 1].id + 1 : 1, name };
      items.push(newItem);
      writeData(items);
      res.writeHead(201);
      res.end(JSON.stringify(newItem));
    });

  // PUT /items/:id - Оновлення елемента за ID
  } else if (method === 'PUT' && url.startsWith('/items/')) {
    const id = parseInt(url.split('/')[2], 10);
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { name } = JSON.parse(body);
      const items = readData();
      const itemIndex = items.findIndex(item => item.id === id);

      if (itemIndex === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Item not found' }));
        return;
      }

      items[itemIndex].name = name;
      writeData(items);
      res.writeHead(200);
      res.end(JSON.stringify(items[itemIndex]));
    });

  // DELETE /items/:id - Видалення елемента за ID
  } else if (method === 'DELETE' && url.startsWith('/items/')) {
    const id = parseInt(url.split('/')[2], 10);
    const items = readData();
    const itemIndex = items.findIndex(item => item.id === id);

    if (itemIndex === -1) {
      res.writeHead(404);
      res.end(JSON.stringify({ message: 'Item not found' }));
      return;
    }

    const deletedItem = items.splice(itemIndex, 1);
    writeData(items);
    res.writeHead(204);
    res.end(JSON.stringify(deletedItem[0]));
  
  // Непідтримуваний маршрут
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: 'Not found' }));
  }
});

// Запуск сервера на порту 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});



// GET /items: Возвращает список всех элементов.

// GET http://localhost:3000/items

// POST /items: Создает новый элемент. Ожидает JSON-данные с полем name.

// Запрос: POST http://localhost:3000/items
// {
//   "name": "First item"
// }

// PUT /items/:id: Обновляет существующий элемент по ID. Ожидает JSON-данные с полем name.
// PUT http://localhost:3000/items/1
// {
//   "name": "Updated item"
// }

//DELETE http://localhost:3000/items/1

// DELETE /items/:id: Удаляет элемент по ID.




