const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once("ready", () => {
  console.log("🤖 Bot đã online");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // LỆNH CHO BOT VÀO PHÒNG
  if (message.content === "!join") {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply("❌ Bạn phải vào phòng voice trước");
    }

    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    message.reply("✅ Bot đã vào phòng và đang ngồi đây");
  }

  // LỆNH RỜI PHÒNG
  if (message.content === "!leave") {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return;

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    connection.destroy();
    message.reply("👋 Bot đã rời phòng");
  }
});

client.login(process.env.TOKEN);
