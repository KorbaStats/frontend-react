import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface ExportReportButtonProps {
  // przeglądarka nazywa plik PDF według document.title
  fileName: string
}

const ExportReportButton = ({ fileName }: ExportReportButtonProps) => {
  const handleExport = () => {
    const root = document.documentElement
    const wasDark = root.classList.contains("dark")
    const previousTitle = document.title

    // wyrzucenie klasy dark mode (czytelnosc strony po wydruku)
    root.classList.remove("dark")
    document.title = fileName

    window.addEventListener(
      "afterprint",
      () => {
        if (wasDark) root.classList.add("dark")
        document.title = previousTitle
      },
      { once: true },
    )

    window.print()
  }

  return (
    <Button className="max-w-50 print:hidden" onClick={handleExport}>
      <Printer />
      Raport PDF
    </Button>
  )
}

export default ExportReportButton
