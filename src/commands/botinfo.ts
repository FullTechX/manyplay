import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from "discord.js";
import os from "os";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import fs from "fs";
import path from "path";
dayjs.extend(duration);

export default {
    data: new SlashCommandBuilder()
        .setName("botinfo")
        .setDescription("ดูข้อมูลของบอท"),

    async execute(interaction: CommandInteraction) {
        const client = interaction.client;

        const uptimeDuration = dayjs.duration(client.uptime || 0);
        const uptimeFormatted = [
            uptimeDuration.days() ? `${uptimeDuration.days()} วัน` : null,
            uptimeDuration.hours() ? `${uptimeDuration.hours()} ชั่วโมง` : null,
            uptimeDuration.minutes() ? `${uptimeDuration.minutes()} นาที` : null,
            uptimeDuration.seconds() ? `${uptimeDuration.seconds()} วินาที` : null,
        ].filter(Boolean).join(" ");

        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        const packageJsonPath = path.resolve(__dirname, "../../package.json"); // ปรับเส้นทางให้ตรงกับตำแหน่งของ package.json
        let packageJson;
        try {
            packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
        } catch (error) {
            console.error("ไม่พบไฟล์ package.json:", error);
            return interaction.reply("ไม่สามารถอ่านข้อมูลจาก package.json ได้");
        }

        const developerName = packageJson.author || "Unknown Developer";
        const version = packageJson.version || "1.0.0";
        const dependencies = packageJson.dependencies ? Object.entries(packageJson.dependencies) : [];
        const devDependencies = packageJson.devDependencies ? Object.entries(packageJson.devDependencies) : [];

        const dependenciesInfo = dependencies.map(([pkg, version]) => `${pkg}: ${version}`).join("\n") || "ไม่มี";
        const devDependenciesInfo = devDependencies.map(([pkg, version]) => `${pkg}: ${version}`).join("\n") || "ไม่มี";

        const embed = new EmbedBuilder()
            .setTitle("🤖 ข้อมูลบอท")
            .setColor("#5865F2")
            .setThumbnail(client.user?.displayAvatarURL() || "")
            .setDescription(
                `> **WebSocket Ping:** \`${interaction.client.ws.ping}ms\`\n` +
                `> **ผู้พัฒนา:** ${developerName}\n` +
                `> **เวอร์ชั่น:** ${version}\n` +
                `> **เซิร์ฟเวอร์ทั้งหมด:** ${client.guilds.cache.size}\n` +
                `> **ผู้ใช้ทั้งหมด:** ${totalUsers}\n` +
                `> **RAM ที่ใช้:** ${ramUsage} MB\n` +
                `> **ระบบ:** ${os.type()} ${os.arch()}\n` +
                `> **เปิดใช้งานมาแล้ว:** ${uptimeFormatted}\n\n` +
                `> **Dependencies:**\n\`\`\`${dependenciesInfo}\`\`\`\n\n` +
                `> **Dev Dependencies:**\n\`\`\`${devDependenciesInfo}\`\`\``
            )
            .setFooter({ text: interaction.client.user?.username || "", iconURL: interaction.client.user?.displayAvatarURL() || undefined })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
