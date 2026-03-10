"use client"
import { useEffect } from 'react'
import NProgress from 'nprogress'
import { usePathname, useSearchParams } from 'next/navigation'
import 'nprogress/nprogress.css'

export default function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.done() // Detener cuando la página cambia
    return () => { NProgress.start() } // Empezar cuando salimos
  }, [pathname, searchParams])

  return null
}