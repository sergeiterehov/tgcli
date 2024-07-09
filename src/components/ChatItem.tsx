import { Box, Text } from "ink";
import { observer } from "mobx-react-lite";
import React from "react";
import { TChat, store } from "../store.js";

export const ChatItem = observer<{ chat: TChat }>((props) => {
  const { chat } = props;

  const isActive = store.activeChat === chat.id;
  const isMute = store.testChatIsMute(chat);

  return (
    <Box paddingX={1} gap={1}>
      <Box flexGrow={1}>
        <Text color={isActive ? "blue" : undefined} bold={isActive} wrap="truncate-middle">
          {chat.name}
        </Text>
      </Box>
      {chat.unreadCount ? (
        <Box>
          <Text backgroundColor={isMute ? "gray" : "blue"} color="white">
            {` ${chat.unreadCount} `}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
});
