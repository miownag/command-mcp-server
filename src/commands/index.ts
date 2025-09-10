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
        if (cmdString.includes("rm -rf /")) {
          throw new Error("rm -rf / is not allowed");
        }
        if (cmdString.includes("rm -rf ~")) {
          throw new Error("rm -rf ~ is not allowed");
        }
        if (cmdString.includes("rm -rf ~/")) {
          throw new Error("rm -rf ~/ is not allowed");
        }
        try {
          const res = await execAsync(cmdString, {
            cwd: path,
          });
          return {
            content: [
              {
                type: "text",
                text: `Stdout: ${res.stdout.trim()}`,
              },
              {
                type: "text",
                text: `Stderr: ${res.stderr.trim()}`,
              },
            ],
          };
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          const exitCode = (error as any)?.code || 1;
          return {
            content: [
              {
                type: "text",
                text: `Error Message: ${(error as any)?.stderr || errorMessage}`,
              },
              {
                type: "text",
                text: `Exit Code: ${exitCode}`,
              },
            ],
            isError: true,
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
