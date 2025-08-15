# 📦 Publishing AstroVisor MCP to NPM

## 🚀 Steps to Publish

### 1. Login to NPM
```bash
npm login
```

### 2. Publish the Package
```bash
npm publish
```

### 3. Verify Publication
```bash
npm info astrovisor-mcp
```

## 📋 Pre-Publication Checklist

- ✅ Version updated in package.json
- ✅ Build completed (`npm run build`)
- ✅ Tests passing (`npm test`)
- ✅ README.md updated
- ✅ LICENSE file present
- ✅ .npmignore configured
- ✅ package.json metadata complete

## 🔄 Updating the Package

### 1. Update Version
```bash
npm version patch  # for bug fixes
npm version minor  # for new features  
npm version major  # for breaking changes
```

### 2. Publish Update
```bash
npm publish
```

## 📊 Package Stats

After publication, users can install with:

```bash
# Via npx (recommended for MCP)
npx astrovisor-mcp

# Global installation
npm install -g astrovisor-mcp

# Local installation
npm install astrovisor-mcp
```

## 🔧 Claude Desktop Configuration

Users will use this config:

```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "npx",
      "args": ["-y", "astrovisor-mcp"],
      "env": {
        "ASTROVISOR_API_KEY": "their-api-key",
        "ASTROVISOR_URL": "https://astrovisor.io"
      }
    }
  }
}
```

## 📈 Marketing

After publication:
- Update documentation at astrovisor.io
- Announce on social media
- Add to MCP server directory
- Update GitHub repository
