# EAC MCP Server Development Guide

## Overview

The EAC MCP (Model Context Protocol) server provides AI assistants with comprehensive context about the EAC Financial Dashboard project. This enables more intelligent code suggestions, pattern recognition, and architectural guidance.

## Implementation Status

### Phase 1: Foundation ✅
- [x] Basic project structure
- [x] TypeScript configuration
- [x] Simplified analysis tool
- [x] Project structure detection
- [x] Pattern identification

### Phase 2: MCP Integration (In Progress)
- [ ] Full MCP SDK integration
- [ ] Tool implementations
- [ ] Resource providers
- [ ] VS Code extension integration

### Phase 3: Advanced Features (Planned)
- [ ] Real-time file watching
- [ ] AI-powered insights
- [ ] Code generation tools
- [ ] Performance analysis

## Quick Start

### 1. Install Dependencies

```bash
cd mcp-server
pnpm install
```

### 2. Build the Server

```bash
pnpm build
```

### 3. Run Simple Analysis

```bash
pnpm start
# or for development
pnpm dev
```

### 4. Test with EAC Project

```bash
EAC_PROJECT_ROOT=/path/to/eac pnpm start
```

## Development Workflow

### Project Structure
```
mcp-server/
├── src/
│   ├── index.ts              # Full MCP server (WIP)
│   ├── index-simple.ts       # Simplified analysis tool
│   ├── tools/                # MCP tool implementations
│   │   ├── project-analyzer.ts
│   │   ├── component-finder.ts
│   │   ├── store-inspector.ts
│   │   ├── convex-analyzer.ts
│   │   └── code-generator.ts
│   └── utils/                # Utility functions
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Tools

1. Create tool class in `src/tools/`
2. Implement required interface
3. Add to main server in `src/index.ts`
4. Update tool registry

### Testing Tools

```bash
# Run specific analysis
node dist/index-simple.js

# Test with different project roots
EAC_PROJECT_ROOT=../eac node dist/index-simple.js
```

## MCP Integration

### Current Capabilities

The simplified server currently provides:

- **Project Analysis**: Overview of architecture and structure
- **Pattern Recognition**: Identification of coding patterns
- **Structure Mapping**: Component, store, and route discovery
- **Recommendation Engine**: Suggestions for improvements

### Future MCP Features

- **Real-time Tools**: Live project analysis
- **Code Generation**: Scaffolding following EAC patterns
- **Resource Providers**: Dynamic project documentation
- **VS Code Integration**: Seamless editor integration

## Configuration

### Environment Variables

```bash
# Project root directory
EAC_PROJECT_ROOT=/path/to/eac/project

# Analysis depth
EAC_ANALYSIS_DEPTH=deep  # shallow|medium|deep

# Enable features
EAC_ENABLE_REALTIME=true
EAC_ENABLE_AI_INSIGHTS=true
```

### MCP Client Configuration

For VS Code integration (future):

```json
{
  "mcpServers": {
    "eac-dashboard": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js"],
      "env": {
        "EAC_PROJECT_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

## API Documentation

### Simplified Analysis API

```typescript
class EACMCPServer {
  // Analyze entire project
  async analyze(): Promise<string>
  
  // Get project context
  private async analyzeProject()
  
  // Analyze file structure
  private async analyzeStructure()
  
  // Identify patterns
  private async analyzePatterns()
}
```

### Example Output

The server provides formatted analysis including:

- Project overview and metadata
- Component/store/route counts
- Identified architectural patterns
- Recommendations for AI development
- Integration insights

## Development Roadmap

### Near Term (Next 2-4 weeks)
- [ ] Complete MCP SDK integration
- [ ] Implement component finder tool
- [ ] Add store inspector functionality
- [ ] Create basic code generator

### Medium Term (1-2 months)
- [ ] Real-time file watching
- [ ] Advanced pattern recognition
- [ ] Performance analysis tools
- [ ] VS Code extension

### Long Term (3+ months)
- [ ] AI-powered code suggestions
- [ ] Automated refactoring tools
- [ ] Integration with other IDEs
- [ ] Team collaboration features

## Contributing

### Setting Up Development

1. Clone the EAC project
2. Navigate to `mcp-server/` directory
3. Install dependencies: `pnpm install`
4. Start development: `pnpm dev`

### Code Standards

- Use TypeScript strict mode
- Follow ESLint configuration
- Add JSDoc comments for public APIs
- Write tests for new tools
- Update documentation

### Testing Changes

```bash
# Build and test
pnpm build
pnpm test

# Test with EAC project
EAC_PROJECT_ROOT=../eac pnpm start

# Lint code
pnpm lint
```

## Troubleshooting

### Common Issues

1. **Module not found errors**: Run `pnpm install` to ensure dependencies
2. **Permission errors**: Check file permissions on project root
3. **Analysis incomplete**: Verify EAC_PROJECT_ROOT points to correct directory
4. **Build failures**: Check TypeScript configuration and imports

### Debug Mode

Enable detailed logging:

```bash
DEBUG=eac:* pnpm start
```

### Support

For development questions or issues:
- Check the main EAC documentation
- Review the MCP specification
- Open issues in the project repository
