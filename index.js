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

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!join") {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("❌ Bạn phải vào phòng voice trước");

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    // ================= LOOP SILENT AUDIO BẰNG BUFFER =================
    const player = createAudioPlayer();
    const silenceBuffer = Buffer.alloc(48000 * 2 * 2, 0); // 1 giây silence, 48kHz, 16bit stereo
    const resource = createAudioResource(silenceBuffer, { inputType: StreamType.Raw });

    player.play(resource);
    connection.subscribe(player);

    // Loop khi audio xong
    player.on("idle", () => {
      const loopResource = createAudioResource(Buffer.alloc(48000 * 2 * 2, 0), { inputType: StreamType.Raw });
      player.play(loopResource);
    });

    // Auto reconnect nếu disconnect
    connection.on("stateChange", (oldState, newState) => {
      if (newState.status === "disconnected") {
        console.log("Bot bị disconnect, đang reconnect...");
        connection.destroy();
        joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          selfDeaf: false
        });
      }
    });

    message.reply("✅ Bot đã vào phòng và đang giữ channel!");
  }

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

client.login(process.env.TOKEN);
