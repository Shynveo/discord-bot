const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log("✅ Bot đã online");
});

client.on("messageCreate", message => {
  if (message.author.bot) return;
  if (message.content === "ping") {
    message.reply("pong 🏓");
  }
});

client.login(process.env.TOKEN);
