import { SlashCommandBuilder, CommandInteraction, GuildMember } from "discord.js";
import { getOrCreatePlayer } from "@/lib/player";;

export default {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("ข้ามเพลงที่กำลังเล่นอยู่"),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> คุณต้องอยู่ในช่องเสียงก่อน!**` }] });

        const player = await getOrCreatePlayer(interaction.guild!.id, member.voice.channel.id, interaction.channel!.id);
        if (!player.queue || player.queue.tracks.length === 0) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> ไม่มีเพลงในคิว!**` }] });

        try {
            await player.skip();
            await interaction.editReply({ embeds: [{ color: 0x00FF00, description: `⏩ ข้ามไปฟังเพลง: **${player.queue.current?.info.title} เรียบร้อย!**` }] });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> เกิดข้อผิดพลาดในการข้ามเพลง!**` }] });
        }
    }
};
