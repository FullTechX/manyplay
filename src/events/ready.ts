import { Client, ActivityType } from "discord.js";

import { logger } from "@/lib/color";
import { checkEnvFile } from "@/lib/env";
import { lavalink } from "@/lib/lavalink";

export default {
    name: "ready",
    once: true,
    async execute(client: Client) {
        await checkEnvFile(".env", ["TOKEN", "DISCORD_CLIENT_ID", "DISCORD_GUILD_ID"]);
        
        await client.user?.setStatus("online");
        await client.user?.setActivity("Music", { type: ActivityType.Listening });
        logger.tagged("BOT", `Ready! Logged in as ${client.user?.tag}`, "yellow", "green");

        await lavalink.init({ id: client.user!.id });
    },
};