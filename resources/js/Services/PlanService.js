import PlanModule from '@/Modules/PlanModule';

const PlanService = {
    fetch: async (callback = () => {}) => {
        await PlanModule.fetch()
            .then((response) => {
                callback(response.data);
            })
    },
    show: async (id, callback = () => {}) => {
        await PlanModule.show(id)
            .then((response) => {
                callback(response.data);
            })
    },
    store: async (data, callback = () => {}) => {
        await PlanModule.store(data)
            .then((response) => {
                callback(response.data);
            })
    },
    update: async (id, data, callback = () => {}) => {
        await PlanModule.update(id, data)
            .then((response) => {
                callback(response.data);
            })
    },
    destroy: async (id, callback = () => {}) => {
        await PlanModule.destroy(id)
            .then((response) => {
                callback(response.data);
            })
    }
}

export default PlanService;
