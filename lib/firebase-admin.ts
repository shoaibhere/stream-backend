import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"

function createFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]!
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  return initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  })
}

const adminApp = createFirebaseAdminApp()

export const messaging = getMessaging(adminApp)
export { adminApp }