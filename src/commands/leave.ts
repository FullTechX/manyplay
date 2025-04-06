import { ChatInputCommandInteraction, SlashCommandBuilder, GuildMember } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("ให้ออกจากห้องเสียง (Voice Channel)"),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> คุณต้องอยู่ในช่องเสียงก่อน!**` }] });

        const botMember = interaction.guild?.members.me;
        if (!botMember?.voice.channel) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> บอทไม่อยู่ในห้องเสียง!**` }] });

        try {
            await botMember.voice.disconnect();
            return interaction.editReply({ embeds: [{ color: 0x00FF00, description: `**<@${interaction.client.user?.id}> ออกจากห้องเสียงแล้ว!**` }] });
        } catch (error) {
            console.error("Error while trying to leave voice channel:", error);
            return interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> เกิดข้อผิดพลาดในการออกจากห้องเสียง!**` }] });
        }
    }
};
