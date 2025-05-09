import dayjs from "dayjs"

export const DateView = (props?: {date?: Date | dayjs.Dayjs | string | null}) => {
    const { date } = props || {}
    
    return date && dayjs(date).format('DD MMM YYYY')
}