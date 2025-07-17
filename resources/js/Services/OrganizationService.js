import OrganizationModule from '@/Modules/OrganizationModule';

const OrganizationService = {
    fetch: async (callback = () => {}) => {
        await OrganizationModule.fetch()
            .then((response) => {
                callback(response.data);
            })
    },
    show: async (id, callback = () => {}) => {
        await OrganizationModule.show(id)
            .then((response) => {
                callback(response.data);
            })
    },
    store: async (data, callback = () => {}) => {
        await OrganizationModule.store(data)
            .then((response) => {
                callback(response.data);
            })
    },
    update: async (id, data, callback = () => {}) => {
        await OrganizationModule.update(id, data)
            .then((response) => {
                callback(response.data);
            })
    },
    destroy: async (id, callback = () => {}) => {
        await OrganizationModule.destroy(id)
            .then((response) => {
                callback(response.data);
            })
    }
}

export default OrganizationService;
