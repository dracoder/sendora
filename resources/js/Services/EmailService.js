import EmailModule from '@/Modules/EmailModule';

const EmailService = {
    preview: async (id, data, callback = () => {}) => {
        await EmailModule.preview(id, data)
            .then((response) => {
                callback(response.data);
            })
    },
    test: async (id, data, callback = () => {}) => {
        await EmailModule.test(id, data)
            .then((response) => {
                callback(response.data);
            })
    },
    testSmtp: async ({organization_name, receiver, data, onSuccess = () => {}, onError = () => {}}) => {
        await EmailModule.testSmtp({ organization_name: organization_name, receiver: receiver, data: data })
            .then((response) => {
                onSuccess(response.data);
            })
            .catch((error) => {
                onError(error.response.data);
            })
    },
}

export default EmailService;
