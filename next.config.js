/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['@supabase/ssr', '@supabase/supabase-js'],
    },
    images: {
        domains: [
            'ekyerljzfokqimbabzxm.supabase.co',
            'firebasestorage.googleapis.com',
            'localhost',
            process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || '',
            'storage.googleapis.com',
            'lh3.googleusercontent.com'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    env: {
        NEXT_PUBLIC_SUPABASE_URL: 'https://ekyerljzfokqimbabzxm.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVreWVybGp6Zm9rcWltYmFienhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTcyODMsImV4cCI6MjA2MjIzMzI4M30.Xd6Cg8QUISHyCG-qbgo9HtWUZz6tvqAqG6KKXzuetBY',
    },
    reactStrictMode: true,
    swcMinify: true,
    optimizeFonts: false
}

module.exports = nextConfig