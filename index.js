const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
const express = require("express");

// ====================== EXPRESS PORT GIẢ ======================
const app = express();
const PORT = process.env.PORT || 1000;

app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(PORT, () => console.log(`Đang nghe trên cổng ${PORT}`));

// ====================== DISCORD BOT ============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Khi bot online
client.once("ready", () => {
  console.log(`🤖 Bot đã trực tuyến: ${client.user.tag}`);
});

// Lắng nghe lệnh !join
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!join") {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("❌ Bạn phải vào phòng voice trước");

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    // Auto reconnect nếu bot bị disconnect
    connection.on("stateChange", (oldState, newState) => {
      if (newState.status === "disconnected") {
        console.log("Bot bị disconnect, đang reconnect...");
        connection.destroy();
        joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
          selfDeaf: false
        });
      }
    });

    message.reply("✅ Bot đã vào phòng và đang ngồi đây");
  }

  // Lệnh !leave để bot rời phòng
  if (message.content === "!leave") {
    const connection = getVoiceConnection(message.guild.id);
    if (connection) {
      connection.destroy();
      message.reply("👋 Bot đã rời phòng");
    } else {
      message.reply("Bot không ở trong voice channel nào!");
    }
  }
});

// Login bot với token từ environment
client.login(process.env.TOKEN);
