import CreditTransactionModule from '@/Modules/CreditTransactionModule';

const CreditTransactionService = {
    fetch: async (callback = () => {}) => {
        await CreditTransactionModule.fetch()
            .then((response) => {
                callback(response.data);
            })
    },
    show: async (id, callback = () => {}) => {
        await CreditTransactionModule.show(id)
            .then((response) => {
                callback(response.data);
            })
    },
    getBalance: async (callback = () => {}) => {
        await CreditTransactionModule.getBalance()
            .then((response) => {
                callback(response.data);
            })
    },
    purchaseCredits: async (creditPackageId, callback = () => {}, errorCallback = () => {}) => {
        try {
            const response = await CreditTransactionModule.purchaseCredits(creditPackageId);
            callback(response.data);
        } catch (error) {
            console.error('Purchase credits error:', error.response?.data || error.message);
            errorCallback(error.response?.data?.message || error.message);
        }
    },
    confirmPurchase: async (paymentIntentId, callback = () => {}, errorCallback = () => {}) => {
        try {
            const response = await CreditTransactionModule.confirmPurchase(paymentIntentId);
            callback(response.data);
        } catch (error) {
            console.error('Confirm purchase error:', error.response?.data || error.message);
            errorCallback(error.response?.data?.message || error.message);
        }
    },
    getPackages: async (callback = () => {}) => {
        await CreditTransactionModule.getPackages()
            .then((response) => {
                callback(response.data);
            })
    }
}

export default CreditTransactionService;