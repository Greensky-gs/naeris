import { AutocompleteListener } from "amethystjs";
import shop from "../cache/shop";
import { resize } from "../utils/toolbox";

export default new AutocompleteListener({
    commandName: [{ commandName: 'magasin', optionName: 'objet' }],
    listenerName: 'Items',
    run: ({ focusedValue, interaction }) => {
        focusedValue = focusedValue.toLowerCase()

        const list = shop.guildItems(interaction)
        const selected = list.filter(x => x.name.toLowerCase().includes(focusedValue) || focusedValue.includes(x.name.toLowerCase()) || x.content.toLowerCase().includes(focusedValue) || focusedValue.includes(x.content.toLowerCase()))

        return selected.map(x => ({ name: resize(`${x.name} - ${x.type === 'role' ? 'Rôle' : 'Texte'}`), value: x.id.toString() }));
    }
})