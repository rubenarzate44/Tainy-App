import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

let db: ReturnType<typeof getFirestore> | null = null;

async function getDb() {
  if (db) return db;

  const res = await fetch("/firebase-applet-config.json");

  if (!res.ok) {
    throw new Error("No se encontró firebase-applet-config.json");
  }

  const config = await res.json();

  const app =
    getApps().length === 0
      ? initializeApp(config)
      : getApp();

  db = getFirestore(app);

  return db;
}

export async function getBookings() {
  const database = await getDb();

  const snapshot = await getDocs(collection(database, "bookings"));

return snapshot.docs.map(document => ({
  id: document.id,
  ...document.data()
}));
}

export async function createBooking(booking: any) {
  const database = await getDb();

  await setDoc(
    doc(database, "bookings", booking.id),
    booking
  );

  return booking.id;
}

export async function updateBooking(id: string, booking: any) {
  const database = await getDb();

  await updateDoc(doc(database, "bookings", id), booking);
}

export async function deleteBooking(id: string) {
  const database = await getDb();

  await deleteDoc(doc(database, "bookings", id));
}