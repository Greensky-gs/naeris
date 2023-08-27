import { AutocompleteListener } from "amethystjs";
import { stations } from "../utils/toolbox";

export default new AutocompleteListener({
    commandName: [{ commandName: 'jouer', optionName: 'musique' }, { commandName: 'info', optionName: 'musique' }, { commandName: 'changer', optionName: 'musique' }],
    listenerName: 'musique',
    run: ({ focusedValue }) => {
        focusedValue = focusedValue.toLowerCase();
        return stations().filter(x => x.name.toLowerCase().includes(focusedValue) || focusedValue.includes(x.name.toLowerCase())).slice(0, 24).map(x => ({ name: x.name, value: x.url }))
    }
})