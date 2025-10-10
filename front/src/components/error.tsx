interface ErrorProps {
    message?: string | string[];
}

export default function Error({ message } : ErrorProps) {
    if (!message) return null;
    const display = Array.isArray(message) ? message[0] : [message];

    return (
        <span className="mt-1 text-sm text-red-600 dark:text-red-400">{display}</span>
    );
};