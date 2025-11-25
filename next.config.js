/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Configuración para @react-pdf/renderer
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      sharp: false,
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      'onnxruntime-node': false,
      fs: false,
      path: false
    }

    config.externals = config.externals || []
    config.externals.push({
      'onnxruntime-node': 'commonjs onnxruntime-node'
    })

    return config
  },
}

module.exports = nextConfig

