import { defineCommand } from 'bn-cli-framework';

export default defineCommand({
  description: 'Say hello',
  arguments: [
    {
      name: 'name',
      description: 'Name to greet',
      required: false,
    },
  ] as const,
  action: async ({ name }) => {
    console.log(`Hello, ${name || 'World'}!`);
  },
});

