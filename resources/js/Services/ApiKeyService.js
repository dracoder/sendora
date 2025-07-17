import ApiKeyModule from '@/Modules/ApiKeyModule';

const ApiKeyService = {
    fetch: async (callback = () => {}) => {
        await ApiKeyModule.fetch()
            .then((response) => {
                callback(response.data);
            })
    },
    show: async (id, callback = () => {}) => {
        await ApiKeyModule.show(id)
            .then((response) => {
                callback(response.data);
            })
    },
    store: async (data, callback = () => {}) => {
        await ApiKeyModule.store(data)
            .then((response) => {
                callback(response.data);
            })
    },
    update: async (id, data, callback = () => {}) => {
        await ApiKeyModule.update(id, data)
            .then((response) => {
                callback(response.data);
            })
    },
    destroy: async (id, callback = () => {}) => {
        await ApiKeyModule.destroy(id)
            .then((response) => {
                callback(response.data);
            })
    }
}

export default ApiKeyService;
