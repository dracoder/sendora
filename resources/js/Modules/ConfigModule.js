import axios from "axios"

const ConfigModule = {
    fetch: async () => {
        return await axios.get(route('configs.index'));
    },
    show: async (id) => {
        return await axios.get(route('configs.show', id), {
            headers: {
                'Resource-Getter': 'true',
            },
        });
    },
    store: async (data) => {
        return await axios.post(route('configs.store'), data);
    },
    update: async (id, data) => {
        return await axios.put(route('configs.update', id), data);
    },
    destroy: async (id) => {
        return await axios.delete(route('configs.destroy', id));
    }
}

export default ConfigModule;
