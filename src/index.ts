import { Client, Collection, GatewayIntentBits, CommandInteraction } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path"

import { logger } from "./lib/color";
import { loadEvents } from "@/lib/load.events";
import { setupLavalink } from "@/lib/lavalink";
import type { SlashCommand } from "@/types/command";
import { setupAutoDisconnectListeners } from "@/lib/player"

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageTyping
    ],
}) as Client & { commands: Collection<string, SlashCommand> };

client.commands = new Collection<string, SlashCommand>();

await loadEvents(client);
await setupLavalink(client);
await setupAutoDisconnectListeners();

client.once("ready", async () => {
    const GUILD_ID = process.env.DISCORD_GUILD_ID as string;

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
        logger.error(`[BOT] ไม่พบ Guild ที่มี ID: ${GUILD_ID}`);
        process.exit(1);
    }

    const commandsPath = join(__dirname, "commands");
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
    const commands = [];

    for (const file of commandFiles) {
        const command = require(join(commandsPath, file)).default as SlashCommand;
        if (!command?.data || !command?.execute) {
            logger.warn(`[COMMAND] คำสั่ง ${file} ไม่ถูกต้อง`);
            continue;
        }

        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }

    await Promise.all(commands.map(async (command) => {
        try {
            const existingCommand = guild.commands.cache.find(c => c.name === command.name);
            if (existingCommand) {
                await existingCommand.edit(command as any);
                logger.success(`[COMMAND] update ${command.name} in Guild ${GUILD_ID}`);
            } else {
                await guild.commands.create(command);
                logger.success(`[COMMAND] add ${command.name} in Guild ${GUILD_ID}`);
            }
        } catch (error) {
            logger.error(`[COMMAND] error add and update command ${command.name}: ${error}`);
        }
    }));
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        logger.info(`[USER] ${interaction.user.tag} ใช้คำสั่ง /${interaction.commandName}`);
        await command.execute(interaction as CommandInteraction);
    } catch (error) {
        logger.error(`[USER] คำสั่ง /${interaction.commandName} มีปัญหา: ${error}`);
        await interaction.reply({ content: "เกิดข้อผิดพลาดในการใช้คำสั่งนี้", ephemeral: true });
    }
});

client.login(process.env.TOKEN as string);