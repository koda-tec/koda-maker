import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/dashboard/', // Bloquea la carpeta privada para que no salga en búsquedas
    },
    sitemap: 'https://koda-maker.vercel.app/sitemap.xml',
  }
}