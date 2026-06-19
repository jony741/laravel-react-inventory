import { Check, CheckCircle, Clock, FileText, X } from 'lucide-react';

type StatusConfig = {
    bg: string;
    text: string;
    icon: React.ReactNode;
};

const statusConfig: Record<string, StatusConfig> = {
    'DRAFT': {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        icon: <FileText className="h-3 w-3" />,
    },
    'APPROVED': {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        icon: <CheckCircle className="h-3 w-3" />,
    },
    'PARTIALLY_RECEIVED': {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        icon: <Clock className="h-3 w-3" />,
    },
    'RECEIVED': {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        icon: <Check className="h-3 w-3" />,
    },
    'CLOSED': {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
        icon: <Check className="h-3 w-3" />,
    },
    'CANCELLED': {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        icon: <X className="h-3 w-3" />,
    },
};

type Props = {
    status: string;
};

export function StatusBadge({ status }: Props) {
    const config = statusConfig[status] || statusConfig['DRAFT'];

    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
            {config.icon}
            {status.replace('_', ' ')}
        </span>
    );
}
