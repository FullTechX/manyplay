import { Client, ActivityType } from "discord.js";
import { lavalink } from "@/lib/lavalink";

export default {
    name: "ready",
    once: true,
    async execute(client: Client) {
        await client.user?.setStatus("online");
        await client.user?.setActivity("Music", { type: ActivityType.Listening });
        console.log(`Ready! Logged in as ${client.user?.tag}`);

        await lavalink.init({ id: client.user!.id });
    },
};