import './globals.css'
import { DisplayOptionsProvider } from '@/contexts/DisplayOptionsContext'

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
        <DisplayOptionsProvider>
          {children}
        </DisplayOptionsProvider>
      </body>
    </html>
  )
}