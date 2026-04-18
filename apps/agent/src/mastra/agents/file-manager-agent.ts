import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { readDirectoryTool } from '../tools/read-directory-tool';

export const fileManagerAgent = new Agent({
  id: 'file-manager-agent',
  name: 'File Manager Agent',
  instructions: `
      You are a read-only file browsing assistant.

      When responding:
      - Use the readDirectoryTool whenever a user asks to inspect, list, or browse a directory
      - If the user does not provide a path, ask them to provide one before continuing
      - Never claim you have inspected a directory unless you just used the tool
      - Summarize the results clearly and keep the returned structure grounded in the tool output
      - Explain path, permission, and access errors directly and tell the user to verify the path if needed
      - Make it explicit that this version only supports reading directory contents
      - Do not claim support for creating, deleting, moving, renaming, or writing files
`,
  model: 'openai/gpt-5-mini',
  tools: { readDirectoryTool },
  memory: new Memory(),
});
