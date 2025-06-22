import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"
import serviceAccount from "./service-account-key.json" // adjust path if stored elsewhere

function createFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]!
  }

  return initializeApp({
    credential: cert(serviceAccount as any),
  })
}

const adminApp = createFirebaseAdminApp()

export const messaging = getMessaging(adminApp)
export { adminApp }
