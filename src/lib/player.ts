import { Player } from "lavalink-client";
import { lavalink } from "@/lib/lavalink";

interface PlayerMetadata {
    lastPlayTime: number;
}

const playerMetadata = new Map<string, PlayerMetadata>();

export const getOrCreatePlayer = async (guildId: string, voiceChannelId: string, textChannelId: string): Promise<Player> => {
    const existingPlayer = lavalink.getPlayer(guildId);
    
    if (existingPlayer) {
        if (existingPlayer.voiceChannelId !== voiceChannelId) {
            existingPlayer.options.voiceChannelId = voiceChannelId;
        }
        
        if (existingPlayer.textChannelId !== textChannelId) {
            existingPlayer.options.textChannelId = textChannelId;
        }
        
        setupDisconnectTimer(existingPlayer);
        
        return existingPlayer;
    }
    
    const playerOptions = {
        guildId,
        voiceChannelId,
        textChannelId,
        selfDeaf: true,
        selfMute: false,
        volume: 100,
        instaUpdateFiltersFix: true,
        applyVolumeAsFilter: false,
        deviceOptions: {
            noiseSuppressionLevel: 1,
            sampleRate: 48000
        }
    };
    
    const newPlayer = await lavalink.createPlayer(playerOptions);
    
    setupDisconnectTimer(newPlayer);
    
    return newPlayer;
};

const disconnectTimers = new Map<string, NodeJS.Timeout>();

const updatePlayerMetadata = (player: Player) => {
    const guildId = player.guildId;
    const metadata = playerMetadata.get(guildId) || { lastPlayTime: Date.now() };
    metadata.lastPlayTime = Date.now();
    playerMetadata.set(guildId, metadata);
};

const getLastPlayTime = (player: Player): number => {
    const metadata = playerMetadata.get(player.guildId);
    return metadata?.lastPlayTime || Date.now();
};

export const setupDisconnectTimer = (player: Player) => {
    const guildId = player.guildId;
    
    if (!playerMetadata.has(guildId)) {
        updatePlayerMetadata(player);
    }
    
    if (disconnectTimers.has(guildId)) {
        clearInterval(disconnectTimers.get(guildId));
    }
    
    const timer = setInterval(async () => {
        try {
            if (!player || !player.connected) {
                clearInterval(timer);
                disconnectTimers.delete(guildId);
                playerMetadata.delete(guildId);
                return;
            }
            
            if (!player.playing && !player.paused) {
                const idleTime = Date.now() - getLastPlayTime(player);
                
                if (idleTime > 30000) {
                    console.log(`[AUTO-DISCONNECT] ตัดการเชื่อมต่อจากช่อง ${player.voiceChannelId} หลังจากไม่มีการใช้งาน 30 วินาที`);
                    
                    await player.destroy();
                    
                    clearInterval(timer);
                    disconnectTimers.delete(guildId);
                    playerMetadata.delete(guildId);
                }
            } else {
                updatePlayerMetadata(player);
            }
        } catch (error) {
            console.error("[AUTO-DISCONNECT] เกิดข้อผิดพลาดในการตรวจสอบ:", error);
        }
    }, 10000);
    
    disconnectTimers.set(guildId, timer);
};


export const setupAutoDisconnectListeners = () => {
    lavalink.on('trackStart', (player) => {
        updatePlayerMetadata(player);
    });

    lavalink.on("trackEnd", async (player) => {
        updatePlayerMetadata(player);
    });

    lavalink.on('queueEnd', (player) => {
        updatePlayerMetadata(player);
    });
};