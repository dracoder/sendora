import UserModule from '@/Modules/UserModule';

const UserService = {
    fetch: async (callback = () => {}) => {
        await UserModule.fetch()
            .then((response) => {
                callback(response.data);
            })
    },
    show: async (id, callback = () => {}) => {
        await UserModule.show(id)
            .then((response) => {
                callback(response.data);
            })
    },
    store: async (data) => {
        return await UserModule.store(data)
    },
    update: async (id, data) => {
        return await UserModule.update(id, data)
    },
    destroy: async (id, callback = () => {}) => {
        await UserModule.destroy(id)
            .then((response) => {
                callback(response.data);
            })
    }
}

export default UserService;
