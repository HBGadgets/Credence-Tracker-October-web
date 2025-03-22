import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    newAddress: {}
}

const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {
        setNewAddress: (state, action) => {
            // Ensure payload is a serializable object (deep clone it)
            const safePayload = JSON.parse(JSON.stringify(action.payload))

            // Merge new addresses instead of replacing state
            state.newAddress = { ...state.newAddress, ...safePayload }
        },
    },
})

export const { setNewAddress } = addressSlice.actions
export default addressSlice.reducer
