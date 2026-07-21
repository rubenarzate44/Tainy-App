import { Booking, PACKAGES } from "../types";

const SPREADSHEET_NAME = "Tanylandia_Reservaciones";

interface SheetRow {
  id: string;
  hostName: string;
  address: string;
  eventDate: string;
  eventTime: string;
  phone: string;
  packageName: string;
  totalPrice: number;
  advancePayment: number;
  pendingBalance: number;
  isPaidInFull: string;
  createdAt: string;
}

// Convert a booking to sheet columns
function bookingToRow(booking: Booking): (string | number)[] {
  const pkg = PACKAGES.find(p => p.id === booking.packageId);
  const pending = booking.totalPrice - booking.advancePayment;
  return [
    booking.id,
    booking.hostName,
    booking.address,
    booking.eventDate,
    booking.eventTime,
    booking.phone,
    pkg ? pkg.name : booking.packageId,
    booking.totalPrice,
    booking.advancePayment,
    pending,
    booking.isPaidInFull ? "SÍ" : "NO",
    booking.createdAt
  ];
}

/**
 * Searches for an existing "Tanylandia_Reservaciones" spreadsheet in the user's Drive.
 */
async function findSpreadsheet(accessToken: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(`name = '${SPREADSHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new Error("Error al buscar archivo en Drive");
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  } catch (error) {
    console.error("findSpreadsheet error:", error);
    return null;
  }
}

/**
 * Creates a brand new Google Spreadsheet with headers.
 */
async function createSpreadsheet(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        properties: { title: SPREADSHEET_NAME },
        sheets: [
          {
            properties: { title: "Reservaciones" },
            data: [
              {
                startRow: 0,
                startColumn: 0,
                rowData: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: "ID" } },
                      { userEnteredValue: { stringValue: "Nombre Anfitrión" } },
                      { userEnteredValue: { stringValue: "Domicilio" } },
                      { userEnteredValue: { stringValue: "Fecha Evento" } },
                      { userEnteredValue: { stringValue: "Hora Evento" } },
                      { userEnteredValue: { stringValue: "Teléfono" } },
                      { userEnteredValue: { stringValue: "Paquete" } },
                      { userEnteredValue: { stringValue: "Monto Total ($)" } },
                      { userEnteredValue: { stringValue: "Anticipo ($)" } },
                      { userEnteredValue: { stringValue: "Saldo Pendiente ($)" } },
                      { userEnteredValue: { stringValue: "Liquidado" } },
                      { userEnteredValue: { stringValue: "Fecha Creación" } }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
    });

    if (!res.ok) throw new Error("Error al crear el archivo en Sheets");
    const data = await res.json();
    return data.spreadsheetId;
  } catch (error) {
    console.error("createSpreadsheet error:", error);
    return null;
  }
}

/**
 * Fully overwrites the spreadsheet content with the current list of bookings.
 * This acts as a true database synchronization.
 */
export async function syncToGoogleSheets(
  accessToken: string,
  bookings: Booking[],
  onStatusUpdate?: (status: string) => void
): Promise<{ success: boolean; url?: string }> {
  try {
    onStatusUpdate?.("Buscando hoja de cálculo...");
    let spreadsheetId = await findSpreadsheet(accessToken);

    if (!spreadsheetId) {
      onStatusUpdate?.("No se encontró una hoja existente. Creando una nueva...");
      spreadsheetId = await createSpreadsheet(accessToken);
    }

    if (!spreadsheetId) {
      throw new Error("No se pudo obtener o crear la hoja de cálculo.");
    }

    onStatusUpdate?.("Hoja de cálculo lista. Escribiendo reservaciones...");

    // Prepare rows
    const headers = [
      "ID",
      "Nombre Anfitrión",
      "Domicilio",
      "Fecha Evento",
      "Hora Evento",
      "Teléfono",
      "Paquete",
      "Monto Total ($)",
      "Anticipo ($)",
      "Saldo Pendiente ($)",
      "Liquidado",
      "Fecha Creación"
    ];

    const values = [headers, ...bookings.map(bookingToRow)];

    // Write range to "Reservaciones!A1"
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Reservaciones!A1:L${values.length + 5}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ values })
      }
    );

    if (!res.ok) {
      throw new Error(`Error de escritura Sheets API: ${res.statusText}`);
    }

    onStatusUpdate?.("Sincronización completada con éxito.");
    return {
      success: true,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    };
  } catch (error: any) {
    console.error("syncToGoogleSheets error:", error);
    onStatusUpdate?.(`Error de sincronización: ${error?.message || error}`);
    return { success: false };
  }
}
