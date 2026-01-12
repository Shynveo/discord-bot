const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const play = require("play-dl");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once("ready", () => {
  console.log("🎵 Bot nhạc đã online");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("!play")) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply("❌ Vào phòng voice trước đã");
    }

    const args = message.content.split(" ");
    const url = args[1];
    if (!url) return message.reply("❌ Gửi link nhạc");

    const stream = await play.stream(url);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    const player = createAudioPlayer();
    player.play(resource);

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    connection.subscribe(player);
    message.reply("▶️ Đang phát nhạc");
  }

  if (message.content === "!leave") {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return;
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });
    connection.destroy();
    message.reply("👋 Bot rời phòng");
  }
});

client.login(process.env.TOKEN);
