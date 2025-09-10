import { defineCommand } from "bn-cli-framework";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

export default defineCommand({
  description: "Run MCP server",
  action: async () => {
    const server = new McpServer({
      name: "command-mcp-server",
      version: "1.0.0",
      capabilities: {
        resources: {},
        tools: {},
      },
    });
    server.tool(
      "execute_command",
      "Execute given command and return output",
      {
        path: z.string().describe("Absolute path to execute command"),
        command: z.string().describe("Command to execute"),
        args: z.array(z.string()).describe("Arguments for command"),
      },
      async ({ path, command, args }) => {
        const cmdString = `${command} ${args.join(" ")}`;
        if (cmdString === 'rm -rf /') {
          throw new Error('rm -rf / is not allowed');
        }
        if (cmdString === 'rm -rf ~') {
          throw new Error('rm -rf ~ is not allowed');
        }
        if (cmdString === 'rm -rf ~/') {
          throw new Error('rm -rf ~/ is not allowed');
        }
        try {
          const res = await execAsync(cmdString, {
            cwd: path,
          });
          return {
            content: [
              {
                type: "text",
                text: res.stdout.trim(),
              },
            ],
          };
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Execute Failed";
          return {
            content: [
              {
                type: "text",
                text: errorMessage,
              },
            ],
          };
        }
      }
    );
    try {
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.error("Server connected");
    } catch (error) {
      console.error("Server connect failed", error);
      process.exit(1);
    }
  },
});
