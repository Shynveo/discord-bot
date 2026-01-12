// index.js
const { Client, GatewayIntentBits } = require("discord.js");
const { 
  joinVoiceChannel, 
  getVoiceConnection, 
  createAudioPlayer, 
  createAudioResource, 
  StreamType 
} = require("@discordjs/voice");
const express = require("express");
const fs = require("fs");

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

client.once("ready", () => {
  console.log(`🤖 Bot đã trực tuyến: ${client.user.tag}`);
});

// Lệnh !join
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

    // ================= LOOP SILENT AUDIO =================
    const player = createAudioPlayer();

    // Tạo audio resource từ file silent.mp3 (1s im lặng)
    if (!fs.existsSync("./silent.mp3")) {
      console.log("❌ Không tìm thấy file silent.mp3. Hãy thêm 1 file âm thanh im lặng.");
    } else {
      const resource = createAudioResource("./silent.mp3", {
        inputType: StreamType.Arbitrary
      });

      player.play(resource);
      connection.subscribe(player);

      // Loop lại khi audio xong
      player.on("idle", () => {
        player.play(resource);
      });
    }

    // Auto reconnect nếu disconnect
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

    message.reply("✅ Bot đã vào phòng và đang giữ channel!");
  }

  // Lệnh !leave
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

// Login với token từ Environment
client.login(process.env.TOKEN);
