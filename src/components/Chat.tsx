import { Box, Text } from "ink";
import { observer } from "mobx-react-lite";
import React from "react";
import { MessageInput } from "./MessageInput.js";
import { Messages } from "./Messages.js";
import { TChat } from "../store.js";

export const Chat = observer<{ chat: TChat }>((props) => {
  const { chat } = props;

  return (
    <Box flexDirection="column" height="100%" width="100%">
      <Box justifyContent="center" paddingX={1} paddingBottom={1}>
        <Text bold>{chat.name}</Text>
      </Box>
      <Box flexGrow={1}>
        <Messages chat={chat} />
      </Box>
      <Box>
        <MessageInput chat={chat} />
      </Box>
    </Box>
  );
});
