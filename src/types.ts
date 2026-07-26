export interface Package {
  id: string;
  name: string;
  price: number;
  cost: number;
  netGain: number;
  description: string;
  services: string[];
}

export interface ExtraService {
  id: string;
  name: string;
  details: string;
  price: number;
  gain: number;
  margin: number;
}

export interface Booking {
  id: string;
  firestoreId?: string;
  hostName: string;
  address: string;
  eventDate: string; // YYYY-MM-DD
  eventTime: string; // HH:MM
  phone: string;
  packageId: string;
  selectedAddOns: { serviceId: string; quantity: number; discount?: number }[];
  totalPrice: number;
  totalCost: number;
  totalNetGain: number;
  advancePayment: number;
  isPaidInFull: boolean;
  notes?: string;
  createdAt: string;
}

export const PACKAGES: Package[] = [
  {
    id: "solo_salon",
    name: "Solo Salón",
    price: 4250,
    cost: 4250,
    netGain: 0,
    description: "Uso exclusivo de las instalaciones del Salón",
    services: ["salón"]
  },
  {
    id: "sirvan",
    name: "Paquete Sirvan",
    price: 5149,
    cost: 4950,
    netGain: 199,
    description: "Salón + 2 Meseros",
    services: ["salón", "mesero", "mesero"]
  },
  {
    id: "animen",
    name: "Paquete Animen",
    price: 5549,
    cost: 4949,
    netGain: 600,
    description: "Salón + Animador",
    services: ["salón", "animador"]
  },
  {
    id: "pinten",
    name: "Paquete Pinten",
    price: 5799,
    cost: 5350,
    netGain: 449,
    description: "Salón + Pintacaritas + Mesero",
    services: ["salón", "pintacaritas", "mesero"]
  },
  {
    id: "decoren",
    name: "Paquete Decoren",
    price: 6749,
    cost: 5749,
    netGain: 1000,
    description: "Salón + Animador + Decoración Arcoíris",
    services: ["salón", "animador", "decoracion_arcoiris"]
  },
  {
    id: "celebren",
    name: "Paquete Celebren",
    price: 8299,
    cost: 6849,
    netGain: 1450,
    description: "Salón + Animador + Pintacaritas + Decoración Arcoíris + Mesero",
    services: ["salón", "animador", "pintacaritas", "decoracion_arcoiris", "mesero"]
  },
  {
    id: "endulces",
    name: "Paquete Endulces",
    price: 8909,
    cost: 7348,
    netGain: 1561,
    description: "Salón + Animador + Pastel Helado",
    services: ["salón", "animador", "pastel_helado"]
  },
  {
    id: "llenes",
    name: "Paquete Llenes",
    price: 13349,
    cost: 9910,
    netGain: 3439,
    description: "Salón + Taquiza + Decoración 360",
    services: ["salón", "taquiza", "decoracion_360"]
  },
  {
    id: "despreocupes",
    name: "Paquete Despreocupes",
    price: 19849,
    cost: 14408,
    netGain: 5441,
    description: "Salón + Mesero + Animador + Pintacaritas + Decoración Tainy + Taquiza + Pastel Helado",
    services: ["salón", "mesero", "animador", "pintacaritas", "decoracion_tainy", "taquiza", "pastel_helado"]
  }
];

export const EXTRA_SERVICES: ExtraService[] = [
  {
    id: "mesero",
    name: "Mesero",
    details: "6 horas",
    price: 449,
    margin: 28,
    gain: 99
  },
  {
    id: "animador",
    name: "Animador",
    details: "5 horas",
    price: 1399,
    margin: 100, // as specified
    gain: 700
  },
  {
    id: "pintacaritas",
    name: "Pintacaritas",
    details: "2 horas",
    price: 1099,
    margin: 47,
    gain: 349
  },
  {
    id: "decoracion_arcoiris",
    name: "Decoración Arcoíris",
    details: "2 arcos",
    price: 1199,
    margin: 40,
    gain: 399
  },
  {
    id: "decoracion_360",
    name: "Decoración 360",
    details: "Círculo decorado con letrero de Feliz Cumpleaños",
    price: 1499,
    margin: 36,
    gain: 399
  },
  {
    id: "decoracion_tainy",
    name: "Decoración Tainy",
    details: "Mampara 100% personalizada, escena para fotografía, un arco",
    price: 1799,
    margin: 29,
    gain: 399
  },
  {
    id: "taquiza",
    name: "Taquiza",
    details: "Taquiza para 80 personas",
    price: 7600,
    margin: 67,
    gain: 3040
  },
  {
    id: "pastel_helado",
    name: "Pastel Helado",
    details: "Pastel para 100 personas",
    price: 3359,
    margin: 40,
    gain: 960
  }
];

export const CONTRACT_TERMS = `Términos y condiciones de Tanylandia:
0. En caso de que permanezca en el salón después del término de su evento se le cobrará una hora extra.
1. El evento debe quedar pagado en su totalidad una semana antes del mismo.
2. En caso de cancelación no se regresará ningún anticipo.
3. Cualquier cambio de fecha está sujeto a disponibilidad.
4. En caso de ingresar un show de cualquier tipo o externo como microondas, inflable, etc. que necesite toma de corriente se cobrarán $300.00 MXN adicionales.

Estrictamente prohibido dentro de Tanylandia:
1. Ingreso de cualquier tipo de mascota.
2. Fumar dentro de las instalaciones.
3. Ingresar pelotas similares a las del juego.
4. Confeti, cañones de papel o espuma de cualquier tipo, en caso de no tomar en cuenta esta política de Tanylandia se cobrarán $300.00 MXN adicionales.

IMPORTANTE: CUALQUIER DESPERFECTO EN LAS INSTALACIONES DE TANYLANDIA (JUEGOS, MOBILIARIO, BAÑOS, ACCESORIOS) CAUSADOS DURANTE EL EVENTO SERÁN RESPONSABILIDAD DEL ANFITRIÓN, EL CUAL DEBERÁ CUBRIR EL MONTO QUE TANYLANDIA INDIQUE AL TÉRMINO DEL EVENTO.`;

export function getEndTime(startTime: string): string {
  if (!startTime || !startTime.includes(":")) return "";
  const [hoursStr, minutesStr] = startTime.split(":");
  let hours = parseInt(hoursStr, 10);
  let minutes = parseInt(minutesStr, 10);
  
  if (isNaN(hours) || isNaN(minutes)) return "";
  
  // Add 6 hours and 30 minutes
  minutes += 30;
  hours += 6;
  
  if (minutes >= 60) {
    hours += 1;
    minutes -= 60;
  }
  
  hours = hours % 24; // Handle overflow past midnight if any
  
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  
  return `${formattedHours}:${formattedMinutes}`;
}

