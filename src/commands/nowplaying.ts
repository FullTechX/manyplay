import { SlashCommandBuilder, CommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import { getOrCreatePlayer } from "@/lib/player";;

export default {
    data: new SlashCommandBuilder()
        .setName("nowplaying")
        .setDescription("ดูขอ้มูลเพลงที่กำลังเล่นอยู่"),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> คุณต้องอยู่ในช่องเสียงก่อน!**` }] });

        const player = await getOrCreatePlayer(interaction.guild!.id, voiceChannel.id, interaction.channel!.id);

        try {
            const currentTrack = player.queue.current;
            if (!currentTrack) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> ไม่มีเพลงที่กำลังเล่นอยู่!**` }] });

            const sourceName = currentTrack.info.sourceName as string;
            const formattedSourceName = sourceName.charAt(0).toUpperCase() + sourceName.slice(1);

            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle(`🎶 ${currentTrack.info.title}`)
                .setURL(currentTrack.info.uri as string)
                .setDescription(`**Album: [${currentTrack.pluginInfo.albumName}](${currentTrack.pluginInfo.albumUrl})**`)
                .setThumbnail(currentTrack.pluginInfo.artistArtworkUrl as string)
                .addFields(
                        { name: "ศิลปิน", value: `**${currentTrack.info.author}**`, inline: false },
                        { name: "ระยะเวลา", value: `**${(Number(currentTrack.info.duration) / 60000).toFixed(2)} นาที**`, inline: true },
                        { name: "แหล่งที่มา", value: `[${formattedSourceName}](${currentTrack.info.uri})`, inline: true },
                    )
                .setImage(currentTrack.info.artworkUrl as string)
                .setFooter({ text: interaction.client.user?.displayName, iconURL: interaction.client.user?.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> เกิดข้อผิดพลาดในการแสดงข้อมูลเพลง!**` }] });
        }
    }
}