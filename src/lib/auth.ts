import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, Auth } from "firebase/auth";

let authInstance: Auth | null = null;
const provider = new GoogleAuthProvider();

// Add Google Sheets and Drive scopes
provider.addScope("https://www.googleapis.com/auth/spreadsheets");
provider.addScope("https://www.googleapis.com/auth/drive.file");

let cachedToken: string | null = null;
let isSigningIn = false;

/**
 * Dynamically initializes Firebase by fetching the config from the server.
 * This prevents static compilation errors if the config doesn't exist yet.
 */
export async function getFirebaseAuth(): Promise<Auth | null> {
  if (authInstance) return authInstance;

  try {
    const res = await fetch("/firebase-applet-config.json");
    if (!res.ok) {
      console.warn("Firebase config not found at /firebase-applet-config.json. Run set_up_oauth to generate it.");
      return null;
    }
    const config = await res.json();
    
    // Check if already initialized
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    authInstance = getAuth(app);
    return authInstance;
  } catch (err) {
    console.error("Failed to initialize Firebase Auth dynamically:", err);
    return null;
  }
}

export const initAuthListener = async (
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) => {
  const auth = await getFirebaseAuth();
  if (!auth) {
    onAuthFailure();
    return () => {};
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedToken) {
        onAuthSuccess(user, cachedToken);
      } else if (!isSigningIn) {
        cachedToken = null;
        onAuthFailure();
      }
    } else {
      cachedToken = null;
      onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  const auth = await getFirebaseAuth();
  if (!auth) {
    alert("La configuración de Google Sheets aún no está completa. Se requiere autorización de OAuth.");
    return null;
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("No se pudo obtener el token de acceso de Google Auth");
    }

    cachedToken = credential.accessToken;
    return { user: result.user, accessToken: cachedToken };
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async () => {
  const auth = await getFirebaseAuth();
  if (auth) {
    await auth.signOut();
  }
  cachedToken = null;
};
