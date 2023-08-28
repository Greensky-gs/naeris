import { AttachmentBuilder, ButtonInteraction, CommandInteraction, ComponentType, InteractionReplyOptions, ModalBuilder, TextInputBuilder, TextInputStyle, User } from "discord.js";
import { paginatorOptions } from "../utils/client";
import { Canvas } from "canvas";
import { button, numerize, row, systemReply } from "../utils/toolbox";
import { log4js } from "amethystjs";

export class ImagesPaginator<T = any> {
    private interaction: CommandInteraction | ButtonInteraction
    private user: User;
    private datas: T[]
    private mapper: (options: T) => Promise<Canvas>
    private index = 0
    private name: string
    private time: number;
    private cache: { index: number; value: Canvas }[] = []

    constructor(options: paginatorOptions<T>) {
        this.interaction = options.interaction;
        this.user = options.user
        this.datas = options.datas
        this.mapper = options.mapper
        this.name = options.name
        this.time = options?.time ?? 300000
        this.cache = []

        this.start()
    }

    private get components() {
        return [
            row(
                button({
                    emoji: '⏮️',
                    id: 'first',
                    disabled: this.index === 0,
                    style: 'Secondary'
                }),
                button({
                    emoji: '◀️',
                    id: 'previous',
                    disabled: this.index === 0,
                    style: 'Secondary'
                }),
                button({
                    emoji: '🔢',
                    id: 'select',
                    disabled: this.datas.length === 1,
                    style: 'Primary'
                }),
                button({
                    id: 'next',
                    disabled: this.index + 1 === this.datas.length,
                    style: 'Secondary',
                    emoji: '▶️'
                }),
                button({
                    id: 'last',
                    disabled: this.index + 1 === this.datas.length,
                    style: 'Secondary',
                    emoji: '⏭️'
                })
            ),
            row(
                button({
                    emoji: '❌',
                    id: 'close',
                    style: 'Danger'
                })
            )
        ]
    }
    private cached(index: number) {
        return !!this.cache.find(x => x.index === index)
    }
    private setCache(index: number, value: Canvas) {
        if (!this.cached(index)) this.cache.push({
            index,
            value
        })
    }
    private getCache(index: number) {
        return this.cache.find(x => x.index === index)?.value;
    }
    private async generateContent(): Promise<InteractionReplyOptions> {
        if (this.cached(this.index % this.datas.length)) return {
            files: [new AttachmentBuilder(this.getCache(this.index % this.datas.length).toBuffer('image/jpeg'))],
            content: '** **',
            components: this.components
        }
        const content = await this.mapper(this.datas[this.index % this.datas.length])
        if (!content) return {
            files: [],
            content: ":x: | Une erreur est survenue",
            components: this.components
        };

        this.setCache(this.index % this.datas.length, content);
        return {
            files: [ new AttachmentBuilder(content.toBuffer('image/jpeg')) ],
            content: '** **',
            components: this.components
        }
    }
    private async start() {
        systemReply(this.interaction, await this.generateContent()).catch(log4js.trace)
        const reply = await this.interaction.fetchReply().catch(log4js.trace)

        if (!reply) return;

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: this.time
        });

        let current = false;
        collector.on('collect', async(ctx) => {
            if (ctx.user.id !== this.user.id) {
                ctx.reply({
                    content: `:x: | Vous ne pouvez pas interagir avec ce message`,
                    ephemeral: true
                }).catch(log4js.trace)
                return
            }
            if (current) {
                ctx.deferUpdate().catch(log4js.trace)
                return
            }
        
            if (ctx.customId === 'close') {
                this.interaction.editReply({
                    content: `Vous avez fermé le paginateur \`${this.name}\``,
                    files: [],
                    components: []
                }).catch(log4js.trace)
                return collector.stop('closed')
            }
            if (ctx.customId === 'next') {
                this.index++;
                current = true;

                await ctx.deferUpdate().catch(log4js.trace)
                const content = await this.generateContent();
                this.interaction.editReply(content).catch(log4js.trace)

                current = false
            }
            if (ctx.customId === 'last') {
                this.index = this.datas.length - 1;
                current = true;

                await ctx.deferUpdate().catch(log4js.trace)
                const content = await this.generateContent();
                this.interaction.editReply(content).catch(log4js.trace)

                current = false
            }
            if (ctx.customId === 'first') {
                this.index = 0;
                current = true;

                await ctx.deferUpdate().catch(log4js.trace)
                const content = await this.generateContent();
                this.interaction.editReply(content).catch(log4js.trace)

                current = false
            }
            if (ctx.customId === 'previous') {
                this.index--;
                current = true;

                await ctx.deferUpdate().catch(log4js.trace)
                const content = await this.generateContent();
                this.interaction.editReply(content).catch(log4js.trace)

                current = false
            }
            if (ctx.customId === 'select') {
                await ctx.showModal(
                    new ModalBuilder()
                        .setTitle("Page")
                        .setCustomId('paginator.select')
                        .setComponents(
                            row(
                                new TextInputBuilder()
                                    .setLabel('Page')
                                    .setPlaceholder(`À quelle page souhaitez vous aller ? (de 1 à ${numerize(this.datas.length)})`)
                                    .setMaxLength(this.datas.length.toString().length)
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(true)
                                    .setCustomId('page')
                            )
                        )
                ).catch(log4js.trace)

                const rep = await ctx.awaitModalSubmit({
                    time: 60000
                }).catch(log4js.trace)
                if (!rep) return;

                const page = parseInt(rep.fields.getTextInputValue('page'))
                if (!page || isNaN(page) || page < 0 || page > this.datas.length) {
                    rep.reply({
                        content: `:x: | Veuillez saisir un nombre valide entre **1** et **${this.datas.length}**`,
                        ephemeral: true
                    }).catch(log4js.trace)
                    return
                }
                this.index = page - 1
                current = true;
                const [_, content] = await Promise.all([rep.deferUpdate().catch(log4js.trace), this.generateContent()])
                this.interaction.editReply(content).catch(log4js.trace)
                
                current = false
            }
        })
    }
}