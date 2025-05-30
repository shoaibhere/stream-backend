import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import LoginForm from "@/components/login-form"

export default async function Home() {
  const cookieStore = cookies()
  const isAuthenticated = (await cookieStore).has("admin_authenticated")

  if (isAuthenticated) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  )
}
