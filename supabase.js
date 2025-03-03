import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("❌ SUPABASE_URL или SUPABASE_KEY не установлены");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET_NAME = "rooms";
const FILE_NAME = "rooms.json";

// Функция для сохранения файла в Supabase
async function saveRoomsToSupabase(rooms) {
  console.log("Попытка сохранить комнаты в Supabase...");
  const { data, error } = await supabase
    .storage
    .from(BUCKET_NAME)
    .upload(FILE_NAME, JSON.stringify(rooms), { upsert: true });

  if (error) {
    console.error("❌ Ошибка при сохранении в Supabase:", error);
    throw error;
  } else {
    console.log("✅ Комнаты сохранены в Supabase");
  }
}

// Функция для загрузки файла из Supabase
async function loadRoomsFromSupabase() {
  console.log("Попытка загрузить комнаты из Supabase...");
  const { data, error } = await supabase
    .storage
    .from(BUCKET_NAME)
    .download(FILE_NAME);

  if (error) {
    console.error("❌ Ошибка при загрузке из Supabase:", error);
    throw error;
  }

  const roomsData = await data.text();
  console.log("✅ Комнаты загружены из Supabase");

  // Парсим данные
  const rooms = JSON.parse(roomsData);

  // Очищаем участников для каждой комнаты
  for (const roomId in rooms) {
    rooms[roomId].players = []; // Сбрасываем участников
  }

  return rooms;
}

export { saveRoomsToSupabase, loadRoomsFromSupabase };