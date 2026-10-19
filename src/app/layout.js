import './globals.css'

export const metadata = {
  title: 'Cali Queue',
  description: 'College esports social platform for California campuses',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
