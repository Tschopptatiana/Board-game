import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import http from "http";
import { Server } from "socket.io";

// Определяем директорию проекта
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(path.join(__dirname, "public"))); // Раздаём статические файлы

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const rooms = {};
const playerColors = ["red", "blue", "green", "yellow", "purple"];
const startPositions = [
  { x: 100, y: 100 }, // Первая фишка
  { x: 200, y: 200 }, // Вторая фишка (сдвиг на 100px)
  { x: 300, y: 100 },
  { x: 400, y: 100 },
  { x: 500, y: 100 }
];


io.on("connection", (socket) => {
  console.log("Игрок подключился", socket.id);

  // Автоматическое подключение в комнату
  socket.on("requestAutoJoin", (roomId) => {
    socket.emit("joinRoom", roomId);
  });


  // Присоединение к комнате
  socket.on("joinRoom", (roomId) => {
    if (!roomId) return;
    if (!rooms[roomId]) rooms[roomId] = { players: [], deck: shuffleDeck() };

    // Назначаем цвет и позицию фишки (располагаем рядом)
    const playerColor = playerColors[rooms[roomId].players.length % playerColors.length];
    const playerData = {
      id: socket.id,
      color: playerColor,
      position: { x: startPositions[rooms[roomId].players.length % playerColors.length].x, y: startPositions[rooms[roomId].players.length % playerColors.length].y }
    };

    rooms[roomId].players.push(playerData);
    socket.join(roomId);

    // Отправляем обновлённый список игроков всем
    io.to(roomId).emit("updatePlayers", rooms[roomId].players);
  });

  // Бросок кубика и передвижение фишки
  socket.on("rollDice", (roomId) => {
    const roll = Math.floor(Math.random() * 6) + 1;
    const player = rooms[roomId].players.find((p) => p.id === socket.id);

    if (player) {
      player.position += roll; // Обновляем позицию игрока
      io.to(roomId).emit("updatePlayers", rooms[roomId].players);
    }
  });

  // Ход фишкой
  socket.on("movePlayer", ({ roomId, x, y }) => {
    const player = rooms[roomId]?.players.find(p => p.id === socket.id);
    if (player) {
        player.position = { x, y };
        io.to(roomId).emit("playerMoved", { playerId: socket.id, x, y });
    }
});


  // Обработка отключения игрока
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      rooms[roomId].players = rooms[roomId].players.filter((p) => p.id !== socket.id);
      io.to(roomId).emit("updatePlayers", rooms[roomId].players);
    }
  });

   // Открытие модального окна по команде
   socket.on("openModal", ({ roomId, category }) => {
    io.to(roomId).emit("openModal", { category }); // Отправляем всем в комнате
});

// Закрытие модального окна по команде
socket.on("closeModal", (roomId) => {
    io.to(roomId).emit("closeModal"); // Закрываем у всех
});

   // Переворот изображения у всех игроков
   socket.on("flipImage", ({ roomId, category, newSrc, flipped }) => {
    io.to(roomId).emit("flipImage", { category, newSrc, flipped });
});
});




// Функция для перемешивания карточек
function shuffleDeck() {
  return ["Карточка 1", "Карточка 2", "Карточка 3"].sort(() => Math.random() - 0.5);
}

// Раздаём index.html при заходе на "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Запуск сервера
server.listen(3000, () => console.log("✅ Сервер запущен на порту 3000"));
