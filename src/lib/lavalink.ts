import { Client } from "discord.js";
import { LavalinkManager } from "lavalink-client";

export const lavalink = new LavalinkManager({
    nodes: [
        {
            id: process.env.LAVALINK_ID as string,
            host: process.env.LAVALINK_HOST as string,
            port: parseInt(process.env.LAVALINK_PORT as string, 10),
            authorization: process.env.LAVALINK_PASSWORD as string,
            secure: false,
        },
    ],
    sendToShard: (guildId: string, payload: any) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    },
    client: { id: process.env.DISCORD_CLIENT_ID as string },
});

let client: Client;

export async function setupLavalink(discordClient: Client) {
    client = discordClient;
    console.log('Lavalink Manager setup completed');

    client.on("ready", async () => {
        try {
            await lavalink.init(client.user?.id! as any);
        } catch (error) {
            console.error("❌ Error connecting Lavalink node:", error);
        }
    });
}