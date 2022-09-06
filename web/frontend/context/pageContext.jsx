import { createContext } from "react";
import { useState } from "react";

export const pageContext = createContext()

export function PageContextProvider({ children }) {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [filter, setFilter] = useState("")
    const [allPages, setAllPages] = useState(null)
    const [pageID, setPageID] = useState(null)
    const [change, setChange] = useState(false)
    const [activeHeader, setActiveHeader] = useState(false)
    const [activeModalDelete, setActiveModalDelete] = useState(false)
    const [activeModalExit, setActiveModalExit] = useState(false)
    const [activeModalCancel, setActiveModalCancel] = useState(false)
    const [selectedItems, setSelectedItems] = useState([]);

    console.log("list pages", allPages)


    return (
        <pageContext.Provider value={{ title, content, filter, allPages, setAllPages, setTitle, setContent, setFilter, activeHeader, setActiveHeader, activeModalDelete, setActiveModalDelete, activeModalExit, setActiveModalExit, activeModalCancel, setActiveModalCancel, pageID, setPageID, selectedItems, setSelectedItems, change, setChange }}>
            {children}
        </pageContext.Provider>
    )
}