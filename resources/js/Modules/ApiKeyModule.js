import axios from "axios"

const ApiKeyModule = {
    fetch: async () => {
        return await axios.get(route('api-keys.index'));
    },
    show: async (id) => {
        return await axios.get(route('api-keys.show', id), {
            headers: {
                'Resource-Getter': 'true',
            },
        });
    },
    store: async (data) => {
        return await axios.post(route('api-keys.store'), data);
    },
    update: async (id, data) => {
        return await axios.put(route('api-keys.update', id), data);
    },
    destroy: async (id) => {
        return await axios.delete(route('api-keys.destroy', id));
    }
}

export default ApiKeyModule;
