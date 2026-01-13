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

// -----------------------------
// Express server (giữ Render awake)
// -----------------------------
const app = express();
const PORT = process.env.PORT || 1000;

app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(PORT, () => console.log(`Đang nghe trên cổng ${PORT}`));

// -----------------------------
// Discord client
// -----------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Event ready
client.once("clientReady", () => {
  console.log(`🤖 Bot đã trực tuyến: ${client.user.tag}`);
});

// -----------------------------
// Audio player loop silent
// -----------------------------
function createSilentPlayer(connection) {
  const player = createAudioPlayer();
  const silenceBuffer = Buffer.alloc(48000 * 2 * 2, 0); // 1 giây im lặng
  const resource = createAudioResource(silenceBuffer, { inputType: StreamType.Raw });

  player.play(resource);
  connection.subscribe(player);

  // Loop infinite
  player.on("idle", () => {
    const loopResource = createAudioResource(Buffer.alloc(48000 * 2 * 2, 0), { inputType: StreamType.Raw });
    player.play(loopResource);
  });

  return player;
}

// -----------------------------
// Lắng nghe message
// -----------------------------
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // !join bot vào voice channel
  if (message.content === "!join") {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("❌ Bạn phải vào phòng voice trước");

    let connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    // Tạo audio loop
    createSilentPlayer(connection);

    // Tự động reconnect nếu disconnect
    connection.on("stateChange", (oldState, newState) => {
      if (newState.status === "disconnected") {
        console.log("Bot bị disconnect, đang reconnect...");
        connection.destroy();
        connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          selfDeaf: false
        });
        createSilentPlayer(connection);
      }
    });

    message.reply("✅ Bot đã vào phòng và đang giữ channel!");
  }

  // !leave bot rời voice channel
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

// -----------------------------
// Login bot
// -----------------------------
client.login(process.env.TOKEN);
