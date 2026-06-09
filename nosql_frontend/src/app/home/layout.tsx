export const metadata = {
  title: 'Spotify RAG',
  description: 'Spotify RAG',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <body>{children}</body>
    </>
  )
}
