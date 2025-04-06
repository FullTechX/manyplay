import { SlashCommandBuilder, CommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import { getOrCreatePlayer } from "@/lib/player";;

export default {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("เล่นเพลงจากชื่อหรือ URL")
        .addStringOption(option =>
            option
                .setName("query")
                .setDescription("ชื่อเพลงหรือ URL")
                .setRequired(true)
        ),

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
    
        try {
            const member = interaction.member as GuildMember;
            const voiceChannel = member.voice.channel;
            if (!voiceChannel) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.user.id}> คุณต้องอยู่ในช่องเสียงก่อน!**` }] });
            
            const query = interaction.options.get("query")?.value as string;
            if (!query) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.user.id}> กรุณาระบุชื่อเพลงหรือ URL!**` }] });
    
            const player = await getOrCreatePlayer(interaction.guild!.id, voiceChannel.id, interaction.channel!.id);

            const result = await player.search({ query }, interaction.user);
            if (!result.tracks.length) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.user.id}> ไม่พบเพลงที่คุณค้นหา!**` }] });
    
            const track = result.tracks[0];
            if (!track) return await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.user.id}> ไม่พบเพลงที่คุณค้นหา!**` }] });
            
            await player.connect();
            await player.queue.add(track);

            if (!player.playing && !player.paused) await player.play(track as any);

            const sourceName = track.info.sourceName as string;
            const formattedSourceName = sourceName.charAt(0).toUpperCase() + sourceName.slice(1);

            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle(`เพิ่มเพลง: **${track.info.title}**`)
                .setURL(track.info.uri as string)
                .setDescription(`🎤 ศิลปิน: **${track.info.author}**`)
                .addFields(
                    { name: "ระยะเวลา", value: `${(Number(track.info.duration) / 60000).toFixed(2)} นาที`, inline: true },
                    { name: "แหล่งที่มา", value: `[${formattedSourceName}](${track.info.uri})`, inline: true }
                )
                .setFooter({ text: interaction.client.user?.displayName, iconURL: interaction.client.user?.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({
                content: "เพิ่มเพลงเรียบร้อย!",
                embeds: [embed],
            });
        } catch (error) {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> เกิดข้อผิดพลาดขณะดำเนินการคำสั่ง กรุณาลองใหม่อีกครั้ง!**` }] });
            } else {
                await interaction.editReply({ embeds: [{ color: 0xFF0000, description: `**<@${interaction.client.user?.id}> เกิดข้อผิดพลาดขณะดำเนินการคำสั่ง กรุณาลองใหม่อีกครั้ง!**` }] });
            }
        }
    }
};