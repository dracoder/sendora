import axios from "axios"

const PlanModule = {
    fetch: async () => {
        return await axios.get(route('plans.index'));
    },
    show: async (id) => {
        return await axios.get(route('plans.show', id), {
            headers: {
                'Resource-Getter': 'true',
            },
        });
    },
    store: async (data) => {
        return await axios.post(route('plans.store'), data);
    },
    update: async (id, data) => {
        return await axios.put(route('plans.update', id), data);
    },
    destroy: async (id) => {
        return await axios.delete(route('plans.destroy', id));
    }
}

export default PlanModule;
