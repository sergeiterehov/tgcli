import React, { useEffect } from "react";
import { useFocusManager } from "ink";
import { observer } from "mobx-react-lite";
import { MessengerPage } from "./pages/MessengerPage.js";
import { AuthFlow, store } from "./store.js";
import { AuthPage } from "./pages/AuthPage.js";

export const App = observer(() => {
  const { enableFocus } = useFocusManager();

  useEffect(() => enableFocus(), []);

  if (store.authFlow !== AuthFlow.OK) {
    return <AuthPage />;
  }

  return <MessengerPage />;
});
