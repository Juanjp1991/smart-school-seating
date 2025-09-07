import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}