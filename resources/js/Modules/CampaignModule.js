import axios from "axios"

const CampaignModule = {
    fetch: async () => {
        return await axios.get(route('campaigns.index'));
    },
    show: async (id) => {
        return await axios.get(route('campaigns.show', id), {
            headers: {
                'Resource-Getter': 'true',
                'Accept': 'application/json'
            },
        });
    },
    store: async (data) => {
        return await axios.post(route('campaigns.store'), data);
    },
    update: async (id, data) => {
        return await axios.put(route('campaigns.update', id), data);
    },
    destroy: async (id) => {
        return await axios.delete(route('campaigns.destroy', id));
    },
    getEmailHistory: (campaignId, emailId, page = 1, filter = 'all', dateFrom = null, dateTo = null) => {
        return axios.get(route('campaigns.emails.history', { campaign: campaignId, email: emailId }), {
            params: { page, filter, date_from: dateFrom, date_to: dateTo }
        });
    },
    retryEmails: (campaignId, emailIds) => {
        return axios.post(route('campaigns.emails.retry', { campaign: campaignId }), { email_ids: emailIds });
    },
    // retryEmail: (campaignId, emailId) => {
    //     return axios.post(route('campaigns.emails.retry', { campaign: campaignId, email: emailId }));
    // },
    getStats: async (id) => {
        return await axios.get(route('campaigns.stats', id));
    },
    getOpenStats: async (id) => {
        return await axios.get(route('campaigns.open-stats', id));
    },
    getOpenedEmails: async (campaignId) => {
        return await axios.get(`/api/campaigns/${campaignId}/opened-emails`);
    }
}

export default CampaignModule;
