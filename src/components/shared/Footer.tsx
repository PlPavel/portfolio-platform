export default function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 h-14 flex items-center justify-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Portfolio Platform
      </div>
    </footer>
  )
}
