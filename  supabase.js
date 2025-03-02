import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET_NAME = "rooms";
const FILE_NAME = "rooms.json";

// Функция для сохранения файла в Supabase
async function saveRoomsToSupabase(rooms) {
  const { data, error } = await supabase
    .storage
    .from(BUCKET_NAME)
    .upload(FILE_NAME, JSON.stringify(rooms), { upsert: true });

  if (error) {
    console.error("❌ Ошибка при сохранении в Supabase:", error);
  } else {
    console.log("✅ Комнаты сохранены в Supabase");
  }
}

// Функция для загрузки файла из Supabase
async function loadRoomsFromSupabase() {
  const { data, error } = await supabase
    .storage
    .from(BUCKET_NAME)
    .download(FILE_NAME);

  if (error) {
    console.error("❌ Ошибка при загрузке из Supabase:", error);
    return {};
  }

  const roomsData = await data.text();
  console.log("✅ Комнаты загружены из Supabase");
  return JSON.parse(roomsData);
}

export { saveRoomsToSupabase, loadRoomsFromSupabase };
