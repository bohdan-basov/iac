# Infrastructure as Code

## Debugging

`.vscode/launch.json`

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch 'build'",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/bin.ts",
      "args": ["build"],
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js", "!**/node_modules/**"],
      "console": "integratedTerminal",
      "cwd": "", // Test project path
      "env": {
        "NODE_OPTIONS": "--enable-source-maps"
      }
    }
  ]
}
```
