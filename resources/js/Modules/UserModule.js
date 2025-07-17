import axios from "axios"

const UserModule = {
    fetch: async () => {
        return await axios.get(route('users.index'));
    },
    show: async (id) => {
        return await axios.get(route('users.show', id), {
            headers: {
                'Resource-Getter': 'true',
            },
        });
    },
    store: async (data) => {
        return await axios.post(route('users.store'), data);
    },
    update: async (id, data) => {
        return await axios.put(route('users.update', id), data);
    },
    destroy: async (id) => {
        return await axios.delete(route('users.destroy', id));
    }
}

export default UserModule;
