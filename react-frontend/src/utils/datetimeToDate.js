export default function dateTimeToDate(datetime) {
    return datetime.toISOString().split('T')[0]
}