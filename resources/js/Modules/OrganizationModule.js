import axios from "axios"

const OrganizationModule = {
    fetch: async () => {
        return await axios.get(route('organizations.index'));
    },
    show: async (id) => {
        return await axios.get(route('organizations.show', id), {
            headers: {
                'Resource-Getter': 'true',
            },
        });
    },
    store: async (data) => {
        return await axios.post(route('organizations.store'), data);
    },
    update: async (id, data) => {
        return await axios.put(route('organizations.update', id), data);
    },
    destroy: async (id) => {
        return await axios.delete(route('organizations.destroy', id));
    }
}

export default OrganizationModule;
