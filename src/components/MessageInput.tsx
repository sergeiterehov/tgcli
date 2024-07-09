import React from "react";
import { useFocus, Box } from "ink";
import TextInput from "ink-text-input";
import { observer } from "mobx-react-lite";
import { TChat, store } from "../store.js";

export const MessageInput = observer<{ chat: TChat }>((props) => {
  const { chat } = props;

  const { isFocused } = useFocus();

  return (
    <Box
      borderStyle={isFocused ? "bold" : "single"}
      borderColor={isFocused ? undefined : "gray"}
      paddingX={1}
      width="100%"
    >
      <TextInput
        focus={isFocused}
        value={store.getDraft(chat.id)}
        onChange={(value) => store.setDraft(chat.id, value)}
        placeholder="Message"
        onSubmit={() => store.sendFromDraft(chat.id)}
      />
    </Box>
  );
});
