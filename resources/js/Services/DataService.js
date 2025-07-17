import axios from "axios"

const DataService = {
    countries: async (callback = () => {}) => {
        await axios.get(route('data.countries'))
            .then((response) => {
                callback(response.data);
            })
    },
}

export default DataService;
