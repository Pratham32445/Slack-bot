import { WebClient } from "@slack/web-api";
import dotenv from "dotenv";
import { App } from "@slack/bolt";
import OpenAI from "openai";
import { response } from "express";

dotenv.config();

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const currentTime = new Date().toString();

async function joinChannel(channelName: string) {
  try {
    const { channels } = await web.conversations.list();
    const channel = channels?.find((c) => c.name === channelName);

    if (channel) {
      await web.conversations.join({ channel: channel.id! });
      console.log(`Joined channel: ${channelName}`);
      return channel.id;
    } else {
      console.error(`Channel ${channelName} not found`);
      return null;
    }
  } catch (error) {
    console.error("Error in joinChannel:", error);
    return null;
  }
}

async function sendMessage(channelId: string,message : string) {
  try {
    await web.chat.postMessage({
      channel: channelId,

      text: message,
    });
    console.log("Message sent successfully.");
  } catch (error) {
    console.error("Error in sendMessage:", error);
  }
}

app.message(async ({ message, say }) => {
  // @ts-ignore
  if ("text" in message && message.text) {
    const Question = message.text;
    if (Question[Question.length - 1] == "?") {
      const res = await getOpenAIResponse(Question);
      if(res) {
        sendMessage("#replitclone",res);
      }
    }
  }
});

const getOpenAIResponse = async (prompt: string) => {
  try {
    const res = await client.completions.create({
      model: "davinci-002",
      prompt,
      max_tokens: 100,
    });
    return res.choices[0].text.trim();
  } catch (error) {
    console.log(error);
    return null;
  }
};

(async () => {
  await app.start(8000);
  console.log("⚡️ Slack bot is running and listening for messages!");
})();
