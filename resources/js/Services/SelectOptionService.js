import SelectOptionModule from "@/Modules/SelectOptionModule";

const SelectOptionService = {
    fetch: async (model, params = { limit: 20, labelKey: 'name' }) => {
        return await SelectOptionModule.fetch(model, params)
    }
}

export default SelectOptionService
