import { SlashCommandBuilder, CommandInteraction, GuildMember } from "discord.js";
import { getOrCreatePlayer } from "@/lib/player";

export default {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("หยุดเพลงที่กำลังเล่นอยู่"),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> คุณต้องอยู่ในช่องเสียงก่อน!**` }] });

        const player = await getOrCreatePlayer(interaction.guild!.id, voiceChannel.id, interaction.channel!.id);

        try {
            const currentTrack = player.queue.current;
            if (!currentTrack) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> ไม่มีเพลงที่กำลังเล่นอยู่!**` }] });

            if (player.paused) {
                await player.resume();
                return await interaction.editReply({ embeds: [{ color: 0x00FF00, description: `▶️ **เล่นเพลงต่อ:** [${currentTrack.info.title}](${currentTrack.info.uri})` }] });
            } else {
                await player.pause();
                return await interaction.editReply({ embeds: [{ color: 0xFFA500, description: `⏸️ **หยุดเพลงชั่วคราว:** [${currentTrack.info.title}](${currentTrack.info.uri})` }] });
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> เกิดข้อผิดพลาดในการหยุดเพลง!**` }] });
        }
    }
}