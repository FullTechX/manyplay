import { lavalink } from "@/lib/lavalink";

export default {
    name: "raw",
    execute(data: any) {
        lavalink.sendRawData(data);
    },
};