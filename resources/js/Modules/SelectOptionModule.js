import axios from "axios"

const SelectOptionModule = {
    fetch: async (model, params = {}) => {
        return await axios.get(route('select.options', model), {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/json',
            },
            params: params
        })
    }
}

export default SelectOptionModule
