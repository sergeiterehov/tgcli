import React from "react";
import { observer } from "mobx-react-lite";
import { AuthFlow, store } from "../store.js";
import TextInput from "ink-text-input";
import { useState } from "react";
import { Box } from "ink";

export const AuthPage = observer(() => {
  const [phone, setPhone] = useState("+7");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  if (store.authFlow === AuthFlow.PhoneNumber) {
    return (
      <Box paddingX={1} borderStyle="single">
        <TextInput
          focus
          value={phone}
          onChange={(value) => setPhone(value)}
          placeholder="Phone Number +79001001010"
          onSubmit={() => store.authPhoneNumber(phone)}
        />
      </Box>
    );
  } else if (store.authFlow === AuthFlow.PhoneCode) {
    return (
      <Box paddingX={1} borderStyle="single">
        <TextInput
          focus
          value={code}
          onChange={(value) => setCode(value)}
          placeholder="Code"
          onSubmit={() => store.authPhoneCode(code)}
        />
      </Box>
    );
  } else if (store.authFlow === AuthFlow.Password) {
    return (
      <Box paddingX={1} borderStyle="single">
        <TextInput
          focus
          mask="*"
          value={password}
          onChange={(value) => setPassword(value)}
          placeholder="Password"
          onSubmit={() => store.authPassword(password)}
        />
      </Box>
    );
  }

  return null;
});
