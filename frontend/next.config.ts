/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        turbopack: true,
    },
    typescript: {
        // Skip type checking during build
        ignoreBuildErrors: true,
    },
    eslint: {
        // Skip ESLint during build
        ignoreDuringBuilds: true,
    },
}

module.exports = nextConfig
