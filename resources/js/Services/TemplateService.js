import TemplateModule from '@/Modules/TemplateModule';

const TemplateService = {
    fetch: async (callback = () => {}) => {
        await TemplateModule.fetch()
            .then((response) => {
                callback(response.data);
            })
    },
    show: async (id, callback = () => {}) => {
        await TemplateModule.show(id)
            .then((response) => {
                callback(response.data);
            })
    },
    store: async (data, callback = () => {}) => {
        await TemplateModule.store(data)
            .then((response) => {
                callback(response.data);
            })
    },
    update: async (id, data, callback = () => {}) => {
        await TemplateModule.update(id, data)
            .then((response) => {
                callback(response.data);
            })
    },
    destroy: async (id, callback = () => {}) => {
        await TemplateModule.destroy(id)
            .then((response) => {
                callback(response.data);
            })
    }
}

export default TemplateService;
