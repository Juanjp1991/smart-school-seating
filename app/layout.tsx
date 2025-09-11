import './globals.css'
import { DisplayOptionsProvider } from '@/contexts/DisplayOptionsContext'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata = {
  title: 'SmartSchool - Classroom Seating',
  description: 'Intelligent classroom seating arrangement tool for teachers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <DisplayOptionsProvider>
            {children}
          </DisplayOptionsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}