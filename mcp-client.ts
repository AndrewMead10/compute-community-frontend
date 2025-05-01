import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { Message, MessageRole } from './components/ChatBox/types';
import { SetStateAction } from 'react';


export interface ServerConfig {
  name: string,
  url: string
}


/*TODO: UNDO THIS ** HARDCODED SERVERS UNTIL RELEASE READY */
export const SERVER_CONFIGURATION: [ServerConfig] = [{
  name: "weather",
  url: "http://localhost:1337/sse"
}];


export interface MCPStatus {
  name: string,
  value: string,
}

export const MCP_STATUS =  {
  "INIT": {name: "Initialized", value: "INIT"},
  "CONNECTED": {name: "Connected", value: "CONNECTED"},
  "ERRORED": {name: "Errored", value: "ERRORED"},
}

interface ToolOptions {
  arguments: any,
  name: string,
  server_name: string
}

interface MCPResponse {
  content: string,
  user_response: string,
  tool: ToolOptions
}
interface MCPRequest {
  user_request: string,
  tool_response: string,
}

const MCPPromptTemplates = {
  "INIT": (tools: String, request: String) => (`You are an MCP client agent. You have access to the following mcptools, each defined with its description, required parameters, and associated server_name. mcptools:
    ${tools}
    Your Responsibilities:
    Interpret the user request.
    Select and invoke the appropriate tool from the mcptools list.
    Use only the tools explicitly defined in the mcptools list. Do not invent or use any tools not listed.
    Fill out all required arguments accurately based on the tool specification.
    Include the correct server_name associated with the tool.

    Response Format: Always respond in the following strict JSON format:
        {
      "content": "text" | "tool_use",
      "user_response": "", 
      "tool": {
        "name": "", 
        "arguments": {}, 
        "server_name": ""
      }
    }
  If the tool needs to be used, set "content": "tool_use" and fill in the tool object.
  If the final response to the user is textual, set "content": "text" and provide only the user_response. The tool field can be ignored or left empty.
  Do not output any text outside this JSON structure. With only one JSON in the response. Also no markdowns.
  
  Request Format:
  You will be provided a request in this format:
  {
    "user_request": "",       // Description of user's intent
    "tool_response": ""       // Tool response if previously used, empty otherwise
  }
    Error Handling:
If tool_response contains an error or indicates failure, you must intelligently revise your response by:
Selecting a different tool if appropriate.
Correcting or modifying the tool arguments based on context or feedback.
When response["content"] is "text", the MCP tool will exit and display response["user_response"] to the user.
    Start by replying with response in the format specified for following request:
    ${request}
    `)
}




export class MCPInterceptor {
  private connections: Map<string, Client> = new Map();
  private status: MCPStatus = MCP_STATUS.INIT;
  private availableTools: any[] = [];
  private history: Message[] = [];
  
  async connectToServer(id: string, url: string): Promise<Client> {
    // Create a new client
    const client = new Client(
      { name: 'multi-server-client', version: '1.0.0' },
      { capabilities: { tools: {}, resources: {}, prompts: {} } }
    );
    
    // Connect using stdio transport
    const transport = new SSEClientTransport(
      new URL(url)
    );
    console.log("Connecting..")
    await client.connect(transport);
    const tools = await client.listTools();
    console.log("Tools listed:", tools);
    
    // Store the connection
    this.connections.set(id, client);
    
    console.log(`Connected to server: ${id}`);
    return client;
  }
  
  getClient(id: string): Client | undefined {
    return this.connections.get(id);
  }
  
  async initAllServers(): Promise<void> {
    for(const server of  SERVER_CONFIGURATION) {
      try {
      let _ = await this.connectToServer(server.name, server.url);
      this.status = MCP_STATUS.CONNECTED;
      } catch(e) {
        this.status = MCP_STATUS.ERRORED;
      }
    }
  }
  
  getAllClients(): Client[] {
    return Array.from(this.connections.values());
  }


  getStatus(): MCPStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.getStatus() == MCP_STATUS.CONNECTED;
  }
  
  isErrored(): boolean {
    return this.getStatus() == MCP_STATUS.ERRORED;
  }
  
  async disconnectAll(): Promise<void> {
    const disconnections = Array.from(this.connections.entries()).map(async ([id, client]) => {
      try {
        await client.close();
        console.log(`Disconnected from server: ${id}`);
      } catch (error) {
        console.error(`Error disconnecting from server ${id}:`, error);
      }
    });
    
    await Promise.all(disconnections);
    this.connections.clear();
  }
  
  // Get all available tools across all servers
  async getAllTools(): Promise<{serverId: string, tools: any[] }[]> {
    const allTools = [];
    console.log(this.connections);
    for(const [connection, client] of this.connections) {
      console.log(connection);
      console.log(connection, client);
      if (client === undefined) {
        console.log("Undefined client");
        allTools.push({ serverId: connection, tools: [] });
        continue
      }
      try {
        const tools = await client.listTools();
        console.log(tools);
        allTools.push({ serverId: connection, tools: tools.tools });
      } catch (error) {
        console.error(`Error getting tools from server ${connection}:`, error);
        allTools.push({ serverId: connection, tools: [] });
      }
    }
    console.log(allTools);
    
    return allTools;
  }

  async callTool(options: ToolOptions): Promise<any> {
    const { name, arguments: args, server_name } = options;

    if (!name) {
      throw new Error('Tool name is required');
    }

    const server = this.connections.get(server_name);
    if (!server) {
      throw new Error(`server_name ${server_name} not found`);
    }

    try {
      const result = await server.callTool({
        name,
        arguments: args,
      });
      const validResult = Array.isArray(result.content) && result.content[0] && typeof result.content[0].text === 'string';
      if (!validResult) {
        return "Unrecognized result from server !";
      }

      const text = (result.content as { text: string }[])[0].text;

      // Check if the tool execution resulted in an error
      if (result.isError) {

        let errorMessage = `Tool error: ${text}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      // Process successful result
      console.log(`Tool result: ${text}`);
      console.log(result.content);
      return result.content;
    } catch (error) {
      // Handle protocol or transport errors
      console.error(`Failed to call tool ${name}:`, error);
      throw error;
    }
    
  }


  getRequest(userRequest:string, response=""): MCPRequest {
    return {
      "user_request": userRequest,
      "tool_response": response
      }
  }
  formatUserRequest(userRequest:string, response=""): string {
    return JSON.stringify(this.getRequest(userRequest, response))
  }


  async getRequestMessage(request:string, error="") {
    if (!this.isConnected()) {
      await this.initAllServers();
      this.availableTools = await this.getAllTools();
      return MCPPromptTemplates["INIT"](JSON.stringify(this.availableTools), this.formatUserRequest(request, error))
    }
    return this.formatUserRequest(request, error);
  }

  getResponse(message: string): MCPResponse|undefined  {
    try {
      const jsonString = message.replace(/```json|```/g, '').trim();
      let response = JSON.parse(jsonString);
      return response;
     } catch(e) {
      console.error(e);
      return undefined;
     }
  }

  emit(message: Message) {
    this.history.push(message)
  }

  getRoleMessage(role:MessageRole, content: string): Message {
    return {
      role, content
    }
  }
  
  
  async sendQuery(callLLM: (messagesWithSystemPrompt: Message[], withUpdates?: boolean) => Promise<string>, role: MessageRole, userMessage="", toolMessage="") {
    const message = await this.getRequestMessage(userMessage, toolMessage);
    this.emit(this.getRoleMessage(role, message));

    const rawResponse = await callLLM(this.history);
    this.emit(this.getRoleMessage("assistant", rawResponse));
    console.log("history:", this.history);

    return this.getResponse(rawResponse);
  }


  async processQuery(userChat: Message[], callLLM:  (messagesWithSystemPrompt: Message[], withUpdates?: boolean) => Promise<string>, updateChat:  (value: SetStateAction<Message[]>) => void) {
    const userMessage = userChat[userChat.length-1]["content"];
    let response = await this.sendQuery(callLLM, "user", userMessage, "");

    let RETRY = 15; // Limit messages in background between system and LLM
    while (RETRY) {
      if (response == undefined) {
        return "Sorry, The model does not support MCP requests please start a new chat !";
      }

      if (response.content == "text") {
        return response.user_response;
      } else if (response.content == "tool_use") {

        if (response.user_response) {
          userChat.push(this.getRoleMessage("assistant", response.user_response));
          updateChat(userChat);
        }
        
        let toolMessage = "";
        try {
          toolMessage = await this.callTool(response.tool);
        } catch(err: any) {
          toolMessage = err.message;
        }

        response = await this.sendQuery(callLLM, "system", "", toolMessage);
      }
      RETRY -= 1;
    }
    return "Could not process request, please try again !"
  }

}

