import axios from "axios"

const SubscriberModule = {
    fetch: async () => {
        return await axios.get(route('subscribers.index'));
    },
    show: async (id) => {
        return await axios.get(route('subscribers.show', id), {
            headers: {
                'Resource-Getter': 'true',
            },
        });
    },
    store: async (data) => {
        return await axios.post(route('subscribers.store'), data);
    },
    update: async (id, data) => {
        return await axios.put(route('subscribers.update', id), data);
    },
    destroy: async (id) => {
        return await axios.delete(route('subscribers.destroy', id));
    }
}

export default SubscriberModule;
