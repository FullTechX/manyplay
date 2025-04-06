import { SlashCommandBuilder, CommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import { getOrCreatePlayer } from "@/lib/player";;

export default {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("ดูคิวเพลงที่อยู่ในคิวทั้งหมด"),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> คุณต้องอยู่ในช่องเสียงก่อน!**` }] });

        const player = await getOrCreatePlayer(interaction.guild!.id, member.voice.channel.id, interaction.channel!.id);
        if (!player.queue || player.queue.tracks.length === 0) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> ไม่มีเพลงในคิว!**` }] });

        try {
            const queue = player.queue.tracks.map((track, index) => {
                return `**${index + 1}.** [${track.info.title}](${track.info.uri})`;
            }).join("\n");

            const currentTrack = player.queue.current ? `[${player.queue.current.info.title}](${player.queue.current.info.uri})` : "ไม่มีเพลงที่กำลังเล่นอยู่";
            const embed = new EmbedBuilder()
                .setColor("#0000FF")
                .setThumbnail(interaction.guild?.iconURL() || "")
                .setTitle("🎶 คิวเพลง")
                .setDescription(queue)
                .addFields(
                    { name: "เพลงที่กำลังเล่น", value: currentTrack },
                    { name: "จำนวนเพลงในคิว", value: `${player.queue.tracks.length} เพลง` }
                )
                .setFooter({ text: interaction.client.user?.username, iconURL: interaction.client.user?.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({
                content: "🎶 คิวเพลง:",
                embeds: [embed],
            });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> เกิดข้อผิดพลาดในการดึงคิวเพลง!**` }] });
        }
    }
};
