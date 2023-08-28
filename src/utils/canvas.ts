import { createCanvas, loadImage, registerFont } from "canvas";
import { coinsImage, leaderboardImage } from "../typings/canvas";
import { numerize } from "./toolbox";

registerFont('./assets/fonts/vinque/vinque_rg.otf', { family: 'Vinque' })

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