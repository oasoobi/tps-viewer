import { world, system, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, } from "@minecraft/server"

system.beforeEvents.startup.subscribe(e => {
    /**@type {import("@minecraft/server").CustomCommand} */
    const tpsCommand = {
        name: "tps:tps",
        description: "TPSとMSPTの表示/非表示を切り替えます。",
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [{ type: CustomCommandParamType.Enum, name: "tps:selections",  }],
        cheatsRequired: false,
    }
    e.customCommandRegistry.registerEnum("tps:selections", ["help", "on", "off"]);
    e.customCommandRegistry.registerCommand(tpsCommand, (origin, ctx) => {
        if (ctx == "on") {
            world.setDynamicProperty("tps_display", true);
            return { status: CustomCommandStatus.Success, message: "TPS表示を有効にしました。" };
        } else if (ctx == "off") {
            world.setDynamicProperty("tps_display", false);
            return { status: CustomCommandStatus.Success, message: "TPS表示を無効にしました。" };
        } else if (ctx == "help") {
            return { status: CustomCommandStatus.Success, message: "使用方法: /tps <on|off>\non: TPS表示を有効にします。\noff: TPS表示を無効にします。" };
        }
        return { status: CustomCommandStatus.Failed, message: "不明な引数です。onかoffを指定してください。" };
    })
})

world.afterEvents.worldLoad.subscribe(() => {
    let lastTime = Date.now();
    const deltaTimes = [];

    const runId = system.runInterval(() => {
        if (!world.getDynamicProperty("tps_display")) return;
        const deltaTime = deltaTimes.length > 0 ? Date.now() - lastTime : 50;
        deltaTimes.push(deltaTime);
        if (deltaTimes.length > 20) deltaTimes.shift();

        const avg = deltaTimes.reduce((v, t) => v + t, 0) / deltaTimes.length;
        const tps = 1000 / avg;
        const mspt = avg

        let color = "§a"; // 緑
        if (tps < 15) {
            color = "§c"; // 赤
        } else if (tps < 18) {
            color = "§e"; // オレンジ
        }

        world.getAllPlayers().forEach(player => {
            player.onScreenDisplay.setActionBar(`TPS: ${color + tps.toFixed(2)}§r MSPT: ${color + mspt.toFixed(2)}§r Avg: ${deltaTime} ms`);
        });
        lastTime = Date.now();
    }, 1);
});