import axios from "axios"

const CreditTransactionModule = {
    fetch: async () => {
        return await axios.get(route('credit-transactions.index'));
    },
    show: async (id) => {
        return await axios.get(route('credit-transactions.show', id), {
            headers: {
                'Resource-Getter': 'true',
            },
        });
    },
    getBalance: async () => {
        return await axios.get(route('credit-transactions.balance'));
    },
    purchaseCredits: async (creditPackageId) => {
        return await axios.post(route('credits.purchase', { creditPackage: creditPackageId }));
    },
    confirmPurchase: async (paymentIntentId) => {
        return await axios.post(route('credits.confirm-purchase'), { payment_intent_id: paymentIntentId });
    },
    getPackages: async () => {
        return await axios.get(route('credit-packages.index'));
    }
}

export default CreditTransactionModule;