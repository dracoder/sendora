import axios from "axios"

const TemplateModule = {
    fetch: async () => {
        return await axios.get(route('templates.index'));
    },
    show: async (id) => {
        return await axios.get(route('templates.show', id), {
            headers: {
                'Resource-Getter': 'true',
            },
        });
    },
    store: async (data) => {
        return await axios.post(route('templates.store'), data);
    },
    update: async (id, data) => {
        return await axios.put(route('templates.update', id), data);
    },
    destroy: async (id) => {
        return await axios.delete(route('templates.destroy', id));
    }
}

export default TemplateModule;
