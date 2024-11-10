"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_api_1 = require("@slack/web-api");
const dotenv_1 = __importDefault(require("dotenv"));
const bolt_1 = require("@slack/bolt");
const openai_1 = __importDefault(require("openai"));
dotenv_1.default.config();
const web = new web_api_1.WebClient(process.env.SLACK_BOT_TOKEN);
const client = new openai_1.default({
    apiKey: process.env.OPENAI_KEY,
});
const app = new bolt_1.App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});
const currentTime = new Date().toString();
function joinChannel(channelName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { channels } = yield web.conversations.list();
            const channel = channels === null || channels === void 0 ? void 0 : channels.find((c) => c.name === channelName);
            if (channel) {
                yield web.conversations.join({ channel: channel.id });
                console.log(`Joined channel: ${channelName}`);
                return channel.id;
            }
            else {
                console.error(`Channel ${channelName} not found`);
                return null;
            }
        }
        catch (error) {
            console.error("Error in joinChannel:", error);
            return null;
        }
    });
}
function sendMessage(channelId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield web.chat.postMessage({
                channel: channelId,
                text: message,
            });
            console.log("Message sent successfully.");
        }
        catch (error) {
            console.error("Error in sendMessage:", error);
        }
    });
}
app.message(({ message, say }) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    if ("text" in message && message.text) {
        const Question = message.text;
        if (Question[Question.length - 1] == "?") {
            const res = yield getOpenAIResponse(Question);
            if (res) {
                sendMessage("#replitclone", res);
            }
        }
    }
}));
const getOpenAIResponse = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield client.completions.create({
            model: "davinci-002",
            prompt,
            max_tokens: 100,
        });
        return res.choices[0].text.trim();
    }
    catch (error) {
        console.log(error);
        return null;
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield app.start(8000);
    console.log("⚡️ Slack bot is running and listening for messages!");
}))();
