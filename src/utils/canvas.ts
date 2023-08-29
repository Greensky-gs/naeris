import { createCanvas, loadImage, registerFont } from "canvas";
import { coinsImage, inventoryImage, leaderboardImage, playingImage } from "../typings/canvas";
import { numerize } from "./toolbox";

registerFont('./assets/fonts/vinque/vinque_rg.otf', { family: 'Vinque' })
registerFont('./assets/fonts/augusta/Augusta.ttf', { family: 'Augusta' })

export const canvasCoins = async(data: coinsImage) => {
    const [ background, pp ] = await Promise.all([ loadImage('./assets/images/coins.jpg'), loadImage(data.user.pp) ]);
    if (!background || !pp) return;

    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext('2d')

    ctx.drawImage(background, 0, 0);

    const margeX = 30;
    const margeY = 30;
    const ppWidth = (pp.width / 2 - 1) * 2

    const drawUsername = () => {
        const x = margeX * 2 + ppWidth
        const y = (canvas.height / 2) - 55
        
        ctx.font = '50px Vinque'
        ctx.fillStyle = 'white'

        ctx.fillText(data.user.username, x, y);
    }

    const drawAvatar = () => {
        const radius = pp.width / 2 - 1;
        const lineWidth = 2;

        const x = radius + margeX;
        const y = canvas.height / 2;

        ctx.strokeStyle = 'white'
        ctx.beginPath()
        ctx.arc(x, y, radius + lineWidth, 0, Math.PI * 2)
        ctx.closePath()
        ctx.stroke()

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()

        ctx.drawImage(pp, x - radius - lineWidth, y - radius - lineWidth)
    }
    const drawCoins = () => {
        const total = data.coins.bank + data.coins.coins

        const x = margeX * 2 + ppWidth + 20
        const y = (canvas.height / 2) + 20

        ctx.font = '35px Vinque'
        ctx.fillStyle = 'white';

        ctx.fillText(`${numerize(total)} gold`, x, y)
    }

    drawUsername();
    drawCoins();
    drawAvatar();

    return canvas;
}

export const canvasLeaderboard = async(data: leaderboardImage[]) => {
    const background = await loadImage('./assets/images/coins.jpg');
    if (!background) return;

    let canvas = createCanvas(background.width, background.height)
    let ctx = canvas.getContext('2d')

    ctx.drawImage(background, 0, 0)

    const x = (i: number) => 128 / 2 + 80;
    const y = (i: number) => (i + 1) * 80 + i * 128;

    for (let i = 0; i < data.length; i++) {
        const value = data[i];

        const pp = await loadImage(value.user.pp);
        if (!pp) return

        const centerX = x(i)
        const centerY = y(i) + 15;

        ctx.font = '50px Augusta'
        ctx.fillStyle = 'white'

        ctx.fillText(`${numerize(value.place)}°`, centerX - (128/2 + 60), centerY + 10)

        ctx.font = '35px Vinque'
        ctx.fillStyle = 'white'

        ctx.fillText(value.user.username, centerX + (128 / 2 + 20), centerY - 10)
        ctx.font = '25px Vinque'

        const total = value.coins.bank + value.coins.coins
        ctx.fillText(`${numerize(total)} gold`, centerX + (128 / 2 + 25), centerY + 25)

        const radius = 128 / 2;

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
        ctx.closePath()
        ctx.fill();

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()

        ctx.drawImage(pp, centerX - radius, centerY - radius);

        const newCanvas = createCanvas(background.width, background.height)
        ctx = newCanvas.getContext('2d')

        ctx.drawImage(canvas, 0, 0);
        canvas = newCanvas;
    }

    return canvas;
}
export const canvasInventory = async(data: inventoryImage) => {
    const [background, pp] = await Promise.all([ loadImage('./assets/images/coins.jpg'), loadImage(data.user.pp) ]);
    if (!background || !pp) return;

    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext('2d')

    ctx.drawImage(background, 0, 0)

    const padding = 40;
    const imageRadius = 64;
    const lineWidth = 2

    const drawUser = () => {
        const x = padding + imageRadius;
        const y = x;

        ctx.fillStyle = 'white'
        ctx.font = '55px Augusta'

        ctx.fillText(data.user.username, padding * 2 + imageRadius * 2, y)

        ctx.beginPath()
        ctx.arc(x, y, imageRadius + lineWidth, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, imageRadius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()

        ctx.drawImage(pp, x - imageRadius, y - imageRadius)
    }

    const items = () => {
        const x = (i: number) => padding * 3 + lineWidth * 2;
        const y = (i: number) => imageRadius * 2 + (100 * i) + (padding * (i + 3))

        data.items.forEach((item, i) => {
            ctx.font = '45px Vinque';
            ctx.fillStyle = 'white'

            ctx.fillText(item.name, x(i), y(i))            

            if (item.quantity > 1) {
                ctx.font = '40px Vinque'
                const posX = x(i) + ctx.measureText(item.name).width + 45

                ctx.fillText(`x${item.quantity}`, posX, y(i));
            }

            const xX = x(i)
            const yY = y(i) + 45

            ctx.font = '35px Vinque'

            if (item.type === 'string') {
                ctx.fillText(item.content, xX, yY);
            } else {
                const role = data.guild.roles.cache.get(item.content);
                ctx.fillStyle = role.hexColor ?? data.guild.members.me.displayHexColor;
                ctx.fillText(`@${role.name ?? 'rôle inconnu'}`, xX, yY)
            }
        })
    }

    items()
    drawUser()

    return canvas;
}
export const canvasPlaying = async(data: playingImage) => {
    const background = await loadImage(`./assets/images/playing${Math.floor(Math.random() * 4)}.png`).catch(() => {})
    if (!background) return

    const canvas = createCanvas(background.width, background.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(background, 0, 0)
    const y = canvas.height / 2
    const x = 30;
    const toX = canvas.width - 30;
    const barHeight = 15

    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.roundRect(x, y, toX - x, barHeight, barHeight / 2)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = 'black'
    ctx.beginPath()
    ctx.roundRect(x - 1, y - 1, toX - x + 1, barHeight + 2, (barHeight + 2) / 2)
    ctx.closePath()
    ctx.stroke()

    const progress = data.timestamp.current.value * 100  / data.timestamp.total.value
    const middleW = (toX - x) * progress / 100
    ctx.fillStyle = '#0074CF';
    ctx.beginPath()
    ctx.roundRect(x, y, middleW, barHeight, barHeight / 2)
    ctx.closePath()
    ctx.fill()

    const textY = y - 30;

    ctx.font = '20px Vinque'
    ctx.fillStyle = 'black'
    ctx.fillText(data.songName, x, textY)

    ctx.font = '18px Augusta'
    ctx.fillStyle = 'white'
    const timestampY = y - 10

    ctx.fillText(data.timestamp.current.label, x, timestampY)
    ctx.fillText(data.timestamp.total.label, toX - ctx.measureText(data.timestamp.total.label).width, timestampY)

    return canvas
}