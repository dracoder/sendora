import CreditPackageModule from '@/Modules/CreditPackageModule';

const CreditPackageService = {
    fetch: async (callback = () => {}) => {
        await CreditPackageModule.fetch()
            .then((response) => {
                callback(response.data);
            })
    },
    show: async (id, callback = () => {}) => {
        await CreditPackageModule.show(id)
            .then((response) => {
                callback(response.data);
            })
    },
    store: async (data, callback = () => {}) => {
        await CreditPackageModule.store(data)
            .then((response) => {
                callback(response.data);
            })
    },
    update: async (id, data, callback = () => {}) => {
        await CreditPackageModule.update(id, data)
            .then((response) => {
                callback(response.data);
            })
    },
    destroy: async (id, callback = () => {}) => {
        await CreditPackageModule.destroy(id)
            .then((response) => {
                callback(response.data);
            })
    },
    purchase: async (id, data, callback = () => {}) => {
        await CreditPackageModule.purchase(id, data)
            .then((response) => {
                callback(response.data);
            })
    }
}

export default CreditPackageService;