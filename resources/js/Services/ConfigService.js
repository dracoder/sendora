import ConfigModule from '@/Modules/ConfigModule';

const ConfigService = {
    fetch: async (callback = () => {}) => {
        await ConfigModule.fetch()
            .then((response) => {
                callback(response.data);
            })
    },
    show: async (id, callback = () => {}) => {
        await ConfigModule.show(id)
            .then((response) => {
                callback(response.data);
            })
    },
    store: async (data, callback = () => {}) => {
        await ConfigModule.store(data)
            .then((response) => {
                callback(response.data);
            })
    },
    update: async (id, data, callback = () => {}) => {
        await ConfigModule.update(id, data)
            .then((response) => {
                callback(response.data);
            })
    },
    destroy: async (id, callback = () => {}) => {
        await ConfigModule.destroy(id)
            .then((response) => {
                callback(response.data);
            })
    }
}

export default ConfigService;
