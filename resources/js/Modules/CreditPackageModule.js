import axios from "axios"

const CreditPackageModule = {
    fetch: async () => {
        return await axios.get(route('credit-packages.index'));
    },
    show: async (id) => {
        return await axios.get(route('credit-packages.show', id), {
            headers: {
                'Resource-Getter': 'true',
            },
        });
    },
    store: async (data) => {
        return await axios.post(route('credit-packages.store'), data);
    },
    update: async (id, data) => {
        return await axios.put(route('credit-packages.update', id), data);
    },
    destroy: async (id) => {
        return await axios.delete(route('credit-packages.destroy', id));
    },
    purchase: async (id, data) => {
        return await axios.post(route('credit-packages.purchase', id), data);
    },
    history: async () => {
        return await axios.get(route('credit-packages.history'));
    }
}

export default CreditPackageModule;