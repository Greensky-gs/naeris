import { createCanvas, loadImage, registerFont } from "canvas";
import { coinsImage } from "../typings/canvas";

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

        // ctx.fillText(`${numerize(total)} gold`)
        ctx.fillText(`${total.toLocaleString('fr')} gold`, x, y)
    }

    drawUsername();
    drawCoins();
    drawAvatar();

    return canvas;
}