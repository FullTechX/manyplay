import { config } from "@/lib/config";

const node = config();
const lavalinkNodes = [];

for (const server of node.server) {
    lavalinkNodes.push({
        id: process.env[`LAVALINK_${server.id}_ID`] || server.id,
        host: process.env[`LAVALINK_${server.id}_HOST`],
        port: parseInt(process.env[`LAVALINK_${server.id}_PORT`] || '80', 10),
        authorization: process.env[`LAVALINK_${server.id}_PASSWORD`],
        secure: process.env[`LAVALINK_${server.id}_SECURE`] === 'true' || false,
    });
}

export const lavalinkNode = lavalinkNodes;