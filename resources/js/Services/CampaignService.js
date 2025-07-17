import CampaignModule from '@/Modules/CampaignModule';

const CampaignService = {
    fetch: async (callback = () => {}) => {
        await CampaignModule.fetch()
            .then((response) => {
                callback(response.data);
            })
    },
    show: async (id, callback = () => {}) => {
        await CampaignModule.show(id)
            .then((response) => {
                callback(response.data);
            })
    },
    store: async (data, callback = () => {}) => {
        await CampaignModule.store(data)
            .then((response) => {
                callback(response.data);
            })
    },
    update: async (id, data, callback = () => {}) => {
        await CampaignModule.update(id, data)
            .then((response) => {
                callback(response.data);
            })
    },
    destroy: async (id, callback = () => {}) => {
        await CampaignModule.destroy(id)
            .then((response) => {
                callback(response.data);
            })
    },
    
    getEmailHistory: async (campaignId, emailId, page = 1, callback = () => {}, filter = 'success', dateFrom = null, dateTo = null) => {
        try {
            const response = await CampaignModule.getEmailHistory(campaignId, emailId, page, filter, dateFrom, dateTo);
            callback(response.data);
        } catch (error) {
            console.error('Error fetching email history:', error);
            callback({ data: [], current_page: 1, per_page: 10, total: 0 });
        }
    },
    
    // retryEmail: async (campaignId, emailId, callback = () => {}) => {
    //     try {
    //         const response = await CampaignModule.retryEmail(campaignId, emailId);
    //         callback(response.data);
    //     } catch (error) {
    //         console.error('Error retrying email:', error);
    //         callback({ success: false });
    //     }
    // },
    
    getStats: async (id, callback = () => {}) => {
        await CampaignModule.getStats(id)
            .then((response) => {
                callback(response.data);
            })
            .catch((error) => {
                console.error('Error fetching campaign stats:', error);
                callback(null);
            });
    },
    
    getOpenedEmails: async (campaignId, callback = () => {}) => {
        await CampaignModule.getOpenedEmails(campaignId)
            .then((response) => {
                callback(response.data);
            })
            .catch((error) => {
                console.error('Error fetching opened emails:', error);
            });
    },
    retryEmails: async (campaignId, emailIds, callback = () => {}) => {
        try {
            const response = await CampaignModule.retryEmails(campaignId, emailIds);
            callback(response.data);
            return response.data;
        } catch (error) {
            console.error('Error retrying emails:', error);
            callback({ success: false });
            return null;
        }
    },
}

export default CampaignService;
