import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import LoginForm from "@/components/login-form"

export default function Home() {
  const cookieStore = cookies()
  const isAuthenticated = cookieStore.has("admin_authenticated")

  if (isAuthenticated) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen admin-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  )
}
