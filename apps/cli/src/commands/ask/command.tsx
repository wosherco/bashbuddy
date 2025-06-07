import { Box, render, Text } from "ink";
import { useAskChatState } from "./state";
import type { AgentTransportClient } from "@bashbuddy/agent/transport";
import { TransporterProvider, useTransporter } from "./context";
import type { z } from "zod";
import type { getLineGroupToolSchema, runCommandToolSchema } from "@bashbuddy/agent/tools";

// Message Components
const UserMessage = ({ content }: { content: string }) => (
  <Box flexDirection="column" marginLeft={2} marginBottom={1}>
    <Text color="cyan" bold>
      You:
    </Text>
    <Text wrap="wrap">{content}</Text>
  </Box>
);

const AssistantMessage = ({ content }: { content: string }) => (
  <Box flexDirection="column" marginLeft={2} marginBottom={1}>
    <Text color="green" bold>
      Assistant:
    </Text>
    <Text wrap="wrap">{content}</Text>
  </Box>
);

const ToolRunCommandMessage = ({
  input,
  output,
  state
}: {
  input: z.infer<typeof runCommandToolSchema>;
  output: string;
  state?: "pending" | "accepted" | "rejected" | "replying"
}) => (
  <Box flexDirection="column" marginLeft={2} marginBottom={1} borderStyle="single" padding={1}>
    <Text color="yellow" bold>
      🔧 Command Tool
    </Text>
    <Text color="gray" wrap="wrap">Command: {input.command}</Text>
    {state && (
      <Text color="magenta">Status: {state}</Text>
    )}
    {output && (
      <Box flexDirection="column" marginTop={1}>
        <Text color="gray">Output:</Text>
        <Text wrap="wrap">{output}</Text>
      </Box>
    )}
  </Box>
);

const ToolGetLineGroupMessage = ({ input }: { input: z.infer<typeof getLineGroupToolSchema> }) => (
  <Box flexDirection="column" marginLeft={2} marginBottom={1} borderStyle="single" padding={1}>
    <Text color="yellow" bold>
      📄 Reading Lines
    </Text>
    <Text color="gray" wrap="wrap">Command: {input.id}</Text>
    <Text color="gray">Lines: {input.from} - {input.to}</Text>
  </Box>
);

// Main Chat Component
const ChatMessages = () => {
  const { messages } = useAskChatState();

  return (
    <Box flexDirection="column" height="100%" paddingX={1}>
      {messages.map((message, index) => {
        switch (message.role) {
          case "user":
            return <UserMessage key={index} content={message.content} />;
          case "assistant":
            return <AssistantMessage key={index} content={message.content} />;
          case "tool-run-command":
            return (
              <ToolRunCommandMessage
                key={index}
                input={message.input}
                output={message.output}
                state={message.state}
              />
            );
          case "tool-get-line-group":
            return (
              <ToolGetLineGroupMessage
                key={index}
                input={message.input}
              />
            );
          default:
            return null;
        }
      })}
    </Box>
  );
};

const AskCommand = () => {
  const { state, messages } = useAskChatState();
  const transporter = useTransporter();

  return (
    <Box flexDirection="column" height="100%">
      {/* Debug info for now - will be replaced with connection state in next steps */}
      <Box borderStyle="single" padding={1} marginBottom={1}>
        <Text color="blue">State: {state} | Messages: {messages.length} | Transport: {transporter.constructor.name}</Text>
      </Box>

      {/* Chat Messages */}
      <ChatMessages />
    </Box>
  );
};

export function runAskCommand(transporter: AgentTransportClient) {
  render(
    <TransporterProvider transporter={transporter}>
      <AskCommand />
    </TransporterProvider>
  );
}