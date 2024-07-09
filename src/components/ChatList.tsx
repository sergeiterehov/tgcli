import { useFocus, useInput, Box } from "ink";
import { observer } from "mobx-react-lite";
import React from "react";
import { ChatItem } from "./ChatItem.js";
import { store } from "../store.js";

export const ChatsList = observer(() => {
  const { isFocused } = useFocus();

  useInput(
    (input, key) => {
      if (key.downArrow) {
        store.moveActiveChatCursor(+1);
      } else if (key.upArrow) {
        store.moveActiveChatCursor(-1);
      }
    },
    { isActive: isFocused }
  );

  return (
    <Box flexDirection="column" borderStyle={isFocused ? "bold" : "single"} gap={1}>
      {store.chats.map((chat) => (
        <ChatItem key={String(chat.id)} chat={chat} />
      ))}
    </Box>
  );
});
