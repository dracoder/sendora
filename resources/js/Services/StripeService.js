import axios from "axios"

const StripeService = {
    createSetupIntent: async (callback = () => {}) => {
        await axios.post(route('stripe.setup-intent'))
            .then((response) => {
                callback(response.data);
            })
    },
    subscribe: async (data, callback = () => {}) => {
        await axios.post(route('stripe.subscribe'), data)
            .then((response) => {
                callback(response.data);
            })
    },
    fetchPaymentHistory: async (callback = () => {}) => {
        await axios.get(route('stripe.payment-history'))
            .then((response) => {
                callback(response.data);
            })
    },
    cancelSubscription: async (callback = () => {}) => {
        await axios.post(route('stripe.cancel-subscription'))
            .then((response) => {
                callback(response.data);
            })
    },
    updatePaymentMethod: async (callback = () => {}) => {
        await axios.get(route('stripe.update-payment-method'))
            .then((response) => {
                callback(response.data);
            })
    },
}

export default StripeService;
