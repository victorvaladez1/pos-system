export const isValidIsoTimestamp = (value: unknown): value is string => {
    if (typeof value !== 'string') {
        return false;
    }

    const isoTimestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;

    if (!isoTimestampPattern.test(value)) {
        return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};