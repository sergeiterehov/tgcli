import React from "react";
import { observer } from "mobx-react-lite";
import { Box, Text } from "ink";
import { store } from "../store.js";
import { Chat } from "../components/Chat.js";
import { ChatsList } from "../components/ChatList.js";

export const MessengerPage = observer(() => {
  const activeChat = store.chats.find((chat) => chat.id === store.activeChat);

  return (
    <Box height={20} overflow="hidden">
      <Box flexDirection="column" width="25%">
        <ChatsList />
      </Box>
      <Box flexDirection="column" height="100%" width="75%">
        {activeChat ? (
          <Chat key={String(activeChat.id)} chat={activeChat} />
        ) : (
          <Box width="100%" height="100%" justifyContent="center" alignItems="center">
            <Text>Select chat</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
});
