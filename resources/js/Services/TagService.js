import TagModule from '@/Modules/TagModule';

const TagService = {
    fetch: async (callback = () => {}) => {
        await TagModule.fetch()
            .then((response) => {
                callback(response.data);
            })
    },
    show: async (id, callback = () => {}) => {
        await TagModule.show(id)
            .then((response) => {
                callback(response.data);
            })
    },
    store: async (data, callback = () => {}) => {
        await TagModule.store(data)
            .then((response) => {
                callback(response.data);
            })
    },
    update: async (id, data, callback = () => {}) => {
        await TagModule.update(id, data)
            .then((response) => {
                callback(response.data);
            })
    },
    destroy: async (id, callback = () => {}) => {
        await TagModule.destroy(id)
            .then((response) => {
                callback(response.data);
            })
    }
}

export default TagService;
