module.exports = {
  apps: [
    {
      name: 'astrovisor-mcp-stdio',
      script: 'build/index.js',
      cwd: '/root/astrovisor-mcp',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        ASTROVISOR_API_KEY: 'pk-admin-7-CfrQ_Kvu96sPBIbTH15QEFTQIX1DMq0UJtdwhNXRU',
        ASTROVISOR_URL: 'https://astrovisor.io'
      },
      error_file: '/root/astrovisor-mcp/logs/stdio-error.log',
      out_file: '/root/astrovisor-mcp/logs/stdio-out.log',
      log_file: '/root/astrovisor-mcp/logs/stdio-combined.log',
      time: true,
      merge_logs: true,
      kill_timeout: 3000
    }
  ]
};
