import { defineCommand } from 'bn-cli-framework';

export default defineCommand({
  description: 'Main command',
  options: [
    {
      flags: '-v, --verbose',
      description: 'Enable verbose output',
    },
  ],
  action: async (options = {}) => {
    console.log('Hello from command-mcp-server!');
    if (options?.verbose) {
      console.log('Verbose mode enabled');
    }
  },
});

