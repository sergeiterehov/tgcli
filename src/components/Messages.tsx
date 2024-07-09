import { useFocus, useInput, measureElement, Box, DOMElement, Text } from "ink";
import { observer } from "mobx-react-lite";
import React, { useRef, useState, useLayoutEffect, useCallback } from "react";
import { Message } from "./Message.js";
import { store, TChat, TMessage } from "../store.js";

export const Messages = observer<{ chat: TChat }>((props) => {
  const { chat } = props;

  const containerRef = useRef<DOMElement>(null);
  const contentRef = useRef<DOMElement>(null);

  const { isFocused } = useFocus();

  const [offset, setOffset] = useState(0);

  const messages: TMessage[] = store.getChatMessages(chat.id);

  messages.sort((a, b) => a.date - b.date);

  const scroll = useCallback((delta: number) => {
    if (!contentRef.current || !containerRef.current) return;

    const container = measureElement(containerRef.current).height;
    const content = measureElement(contentRef.current).height;

    setOffset((prev) => {
      if (container > content) {
        return content - container;
      }

      return Math.max(0, Math.min(content - container, prev + delta));
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    if (!contentRef.current || !containerRef.current) return;

    const container = measureElement(containerRef.current).height;
    const content = measureElement(contentRef.current).height;

    setOffset(content - container);
  }, []);

  useInput(
    (input, key) => {
      if (key.downArrow) {
        scroll(+1);
      } else if (key.upArrow) {
        scroll(-1);
      }
    },
    { isActive: isFocused }
  );

  useLayoutEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  return (
    <Box ref={containerRef} position="relative" overflow="hidden" flexGrow={1}>
      <Box ref={contentRef} flexDirection="column" width="100%" position="absolute" marginTop={-offset}>
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
      </Box>
    </Box>
  );
});
