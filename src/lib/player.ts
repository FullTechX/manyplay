import { Player } from "lavalink-client";
import { lavalink } from "@/lib/lavalink";

export const getOrCreatePlayer = async (guildId: string, voiceChannelId: string, textChannelId: string): Promise<Player> => {
    let player = lavalink.getPlayer(guildId);
    
    if (!player) {
        player = await lavalink.createPlayer({
            guildId,
            voiceChannelId,
            textChannelId,
            selfDeaf: true,
            selfMute: false,
            volume: 100,
        });
    }
    
    return player;
};
