import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("เช็กความเร็วของบอทและ Discord API"),

    async execute(interaction: CommandInteraction) {
        const sent = await interaction.reply({ content: "🏓 Pong!", fetchReply: true });

        const embed = new EmbedBuilder()
            .setColor(0x1DB954)
            .setTitle("🏓 Pong!")
            .setDescription(
                `> **WebSocket Ping: ** \`${interaction.client.ws.ping}ms\`\n` +
                `> **Message Latency: ** \`${sent.createdTimestamp - interaction.createdTimestamp}ms\``
            )
            .setFooter({ text: interaction.client.user?.username || "", iconURL: interaction.client.user?.displayAvatarURL() || undefined })
            .setTimestamp();

        await interaction.editReply({ content: "", embeds: [embed] });
    },
};
