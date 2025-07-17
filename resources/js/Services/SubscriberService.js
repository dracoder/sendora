import SubscriberModule from '@/Modules/SubscriberModule';

const SubscriberService = {
    fetch: async (callback = () => {}) => {
        await SubscriberModule.fetch()
            .then((response) => {
                callback(response.data);
            })
    },
    show: async (id, callback = () => {}) => {
        await SubscriberModule.show(id)
            .then((response) => {
                callback(response.data);
            })
    },
    store: async ({data, onSuccess = () => {}, onError = () => {}}) => {
        await SubscriberModule.store(data)
            .then((response) => {
                onSuccess(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    onError(error.response.data);
                } else {
                    onError({ message: error.message || 'An error occurred' });
                }
            })
    },
    update: async ({id, data, onSuccess = () => {}, onError = () => {}}) => {
        await SubscriberModule.update(id, data)
            .then((response) => {
                onSuccess(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    onError(error.response.data);
                } else {
                    onError({ message: error.message || 'An error occurred' });
                }
            })
    },
    destroy: async (id, callback = () => {}) => {
        await SubscriberModule.destroy(id)
            .then((response) => {
                callback(response.data);
            })
    }
}

export default SubscriberService;
