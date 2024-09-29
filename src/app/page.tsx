import MangaReaderHome from '@/components/MangaReaderHome'
import { HeaderComponent } from '@/components/Header'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderComponent />
      <MangaReaderHome />
    </div>
  )
}