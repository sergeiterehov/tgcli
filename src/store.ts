import { readFileSync, writeFileSync } from "fs";
import { action, makeAutoObservable, runInAction } from "mobx";
import { Api, TelegramClient } from "telegram/index.js";
import { StringSession } from "telegram/sessions/index.js";
import type { Dialog } from "telegram/tl/custom/dialog";
import { getPeerId } from "telegram/Utils.js";

export enum AuthFlow {
  Connecting,
  PhoneNumber,
  PhoneCode,
  Password,
  OK,
}

export type TChat = Dialog;
export type TMessage = Api.Message;

const apiId = Number(process.env["API_ID"]);
const apiHash = String(process.env["API_HASH"]);

const readSession = () => {
  try {
    return readFileSync("session.local.json", { encoding: "utf8" });
  } catch (e) {
    return "";
  }
};
const writeSession = (session?: string) => {
  if (!session) return;

  try {
    writeFileSync("session.local.json", session, { encoding: "utf8" });
  } catch (e) {
    // TODO:
  }
};

const stringSession = new StringSession(readSession());

class Store {
  time = 0;

  readonly client: TelegramClient;

  authFlow: AuthFlow;

  chats: TChat[] = [];

  messages: TMessage[] = [];

  activeChat?: TChat["id"];
  drafts = new Map<TChat["id"], string>();

  requestedMessages = new Set();

  constructor() {
    makeAutoObservable(this);

    setInterval(
      action(() => {
        this.time = Date.now();
      }),
      200
    );

    this.client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });

    this.authFlow = AuthFlow.Connecting;

    this.client
      .start({
        phoneNumber: this._handlePhoneNumber,
        password: this._handlePassword,
        phoneCode: this._handlePhoneCode,
        onError: this._handleError,
      })
      .then(this._handleConnected, this._handleError);
  }

  private _authPhoneNumber?: { resolve(s: string): void; reject(e?: any): void };
  private _authPassword?: { resolve(s: string): void; reject(e?: any): void };
  private _authPhoneCode?: { resolve(s: string): void; reject(e?: any): void };

  private _handlePhoneNumber = async () =>
    new Promise<string>((resolve, reject) => {
      this._authPhoneNumber = { resolve, reject };
      this.authFlow = AuthFlow.PhoneNumber;
    });
  private _handlePassword = async () =>
    new Promise<string>((resolve, reject) => {
      this._authPassword = { resolve, reject };
      this.authFlow = AuthFlow.Password;
    });
  private _handlePhoneCode = async () =>
    new Promise<string>((resolve, reject) => {
      this._authPhoneCode = { resolve, reject };
      this.authFlow = AuthFlow.PhoneCode;
    });

  private _handleError = (err: Error) => console.log(err);

  private _handleConnected = async () => {
    this.authFlow = AuthFlow.OK;
    writeSession(this.client.session.save()!);

    const dialogs = await this.client.getDialogs();

    this.chats = dialogs;
  };

  authPhoneNumber(number: string) {
    this._authPhoneNumber?.resolve(number);
  }

  authPhoneCode(number: string) {
    this._authPhoneCode?.resolve(number);
  }

  authPassword(number: string) {
    this._authPassword?.resolve(number);
  }

  moveActiveChatCursor(delta: number) {
    let index = this.chats.findIndex((chat) => chat.id === this.activeChat);

    index = Math.max(0, Math.min(this.chats.length - 1, index + delta));
    this.setActiveChat(this.chats[index]?.id);
  }

  async setActiveChat(chatId?: TChat["id"]) {
    this.activeChat = chatId;

    if (chatId !== undefined) {
      for await (const message of this.client.iterMessages(chatId, { limit: 30 })) {
        runInAction(() => {
          for (const other of this.messages) if (other.id === message.id) return;

          this.messages.push(message);
        });
      }
    }
  }

  getDraft(chatId: TChat["id"]) {
    return this.drafts.get(chatId) || "";
  }

  setDraft(chatId: TChat["id"], text: string) {
    this.drafts.set(chatId, text);
  }

  async sendFromDraft(chatId: TChat["id"]) {
    if (!chatId) return;

    const draft = this.drafts.get(chatId);

    if (!draft) return;

    this.drafts.delete(chatId);

    const newMessage = await this.client.sendMessage(chatId, { message: draft });

    runInAction(() => {
      this.messages.push(newMessage);
    });
  }

  getChatMessages(chatId: TChat["id"]) {
    const chat = this.chats.find((chat) => chat.id === chatId);

    if (!chat) return [];

    const messages: TMessage[] = [];

    for (const message of this.messages) {
      if (getPeerId(message.peerId) === getPeerId(chat.dialog.peer)) {
        messages.push(message);
      }
    }

    return messages;
  }

  testChatIsMute(chat: TChat) {
    return (chat.dialog.notifySettings.muteUntil || 0) * 1000 > this.time;
  }
}

export const store = new Store();
