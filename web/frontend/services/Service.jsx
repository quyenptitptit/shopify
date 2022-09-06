import { useAuthenticatedFetch } from '../hooks'

const fetchApi = useAuthenticatedFetch()

export const getPages = async () => {
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    }
    try {
        const res = await fetchApi('/api/pages', options)
        const data = await res.json()
        console.log(data)
        return data
    }
    catch (e) {
        console.log(e)
    }
}

export const getPage = async (id) => {
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    }
    try {
        const res = await fetchApi(`api/pages/:${id}`, options)
        const data = await res.json()
        console.log(data)
        return data
    }
    catch (e) {
        console.log(e)
    }
}

export const createPage = async (newPage) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(newPage)
    }
    try {
        const res = await fetchApi('/api/pages', options)
        const data = await res.json()
        console.log(data)
        return data
    }
    catch (e) {
        console.log(e)
    }
}

export const updatePage = async (id, updatedPage) => {
    const options = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(updatedPage)
    }
    try {
        const res = await fetchApi(`/api/pages/:${id}`, options)
        const data = await res.json()
        console.log(data)
        return data
    }
    catch (e) {
        console.log(e)
    }
}

export const deletePage = async (id) => {
    const options = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    }
    try {
        const res = await fetchApi(`/api/pages/:${id}`, options)
        const data = await res.json()
        console.log(data)
        return data
    }
    catch (e) {
        console.log(e)
    }
}