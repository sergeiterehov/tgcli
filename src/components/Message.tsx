import { Box, Text } from "ink";
import { observer } from "mobx-react-lite";
import React from "react";
import { TMessage } from "../store.js";

export const Message = observer<{ message: TMessage }>((props) => {
  const { message } = props;

  const my = false;

  return (
    <Box
      flexDirection={my ? "row-reverse" : "row"}
      justifyContent={my ? "flex-end" : "flex-start"}
      alignItems="flex-end"
      gap={1}
    >
      <Box paddingX={1} borderStyle="single" borderColor={my ? "blue" : undefined}>
        <Text>{message.message}</Text>
      </Box>
      <Box flexGrow={1} paddingBottom={1} justifyContent={my ? "flex-end" : "flex-start"} flexShrink={0}>
        <Text color="gray">10:44</Text>
      </Box>
    </Box>
  );
});
