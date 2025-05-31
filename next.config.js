/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: [],
    },
    images: {
        domains: [
            'firebasestorage.googleapis.com',
            'localhost',
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
    reactStrictMode: true,
    swcMinify: true,
    optimizeFonts: false
}

module.exports = nextConfig