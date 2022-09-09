import { atom } from 'recoil'

export const itemRecoil = atom({
    key: 'item',
    default: []
})

export const pagesRecoil = atom({
    key: 'pages',
    default: []
})

export const panigationRecoil = atom({
    key: 'panigation',
    default: []
})

export const selectedItemsRecoil = atom({
    key: 'selectedItems',
    default: []
})

// export const currentPageRecoil = atom({
//     key: 'currentPage',
//     default: 1
// })

