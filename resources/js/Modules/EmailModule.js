import axios from "axios"

const EmailModule = {
    preview: async (id, data) => {
        return await axios.post(route('emails.preview', id), data);
    },
    test: async (id, data) => {
        return await axios.post(route('emails.test', id), data);
    },
    testSmtp: async (data) => {
        return await axios.post(route('emails.test-smtp'), data);
    },
}

export default EmailModule;
