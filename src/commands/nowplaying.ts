import { SlashCommandBuilder, CommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import { formatDuration } from "@/lib/format.time";
import { getOrCreatePlayer } from "@/lib/player";

function generateProgressBar(position: number, duration: number, size: number = 20): string {
    const percentage = position / duration;
    const progress = Math.round(percentage * size);
    const empty = size - progress;

    const bar = "─".repeat(progress) + "🔘" + "─".repeat(empty);
    return bar;
}

export default {
    data: new SlashCommandBuilder()
        .setName("nowplaying")
        .setDescription("ดูข้อมูลเพลงที่กำลังเล่นอยู่"),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.user.id}> คุณต้องอยู่ในช่องเสียงก่อน!**` }] });

        const player = await getOrCreatePlayer(
            interaction.guild!.id,
            voiceChannel.id,
            interaction.channel!.id
        );

        const currentTrack = player.queue.current;
        if (!currentTrack) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setDescription(`🎵 **ไม่มีเพลงที่กำลังเล่นอยู่ในขณะนี้!**`)
                ]
            });
        }

        const position = player.position || 0;
        const duration = currentTrack.info.duration || 1;
        const formattedPosition = formatDuration(position);
        const formattedDuration = formatDuration(duration);
        const requesterName = currentTrack.requester || interaction.user.id;

        const sourceName = currentTrack.info.sourceName || "Unknown";
        const formattedSourceName = sourceName.charAt(0).toUpperCase() + sourceName.slice(1);

        const embed = new EmbedBuilder()
            .setColor(0x1DB954)
            .setAuthor({ name: `กำลังเล่นเพลง ${currentTrack.info.title} 🎧`, iconURL: currentTrack.pluginInfo.artistArtworkUrl || currentTrack.info.artworkUrl || undefined })
            .setDescription(
                `> **เวลา:** \`${formattedPosition}\` / \`${formattedDuration}\`\n` +
                `> **ขอโดย: <${requesterName}>**`
            )
            .setImage(currentTrack.info.artworkUrl)
            .addFields(
                { name: "ศิลปิน", value: currentTrack.info.author || "ไม่ระบุ", inline: true },
                { name: "อัลบั้ม", value: currentTrack.pluginInfo.albumName ? `[${currentTrack.pluginInfo.albumName}](${currentTrack.pluginInfo.albumUrl})` : "ไม่ระบุ", inline: true },
                { name: "ที่มา", value: `[${formattedSourceName}](${currentTrack.info.uri})`, inline: true },
            )
            .setFooter({ text: interaction.client.user?.username || "", iconURL: interaction.client.user?.displayAvatarURL() || undefined })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
