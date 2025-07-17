import axios from "axios"

const TagModule = {
    fetch: async () => {
        return await axios.get(route('tags.index'));
    },
    show: async (id) => {
        return await axios.get(route('tags.show', id), {
            headers: {
                'Resource-Getter': 'true',
            },
        });
    },
    store: async (data) => {
        return await axios.post(route('tags.store'), data);
    },
    update: async (id, data) => {
        return await axios.put(route('tags.update', id), data);
    },
    destroy: async (id) => {
        return await axios.delete(route('tags.destroy', id));
    }
}

export default TagModule;
