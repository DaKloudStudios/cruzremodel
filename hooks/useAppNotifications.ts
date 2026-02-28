import { useState, useEffect } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { useSettings } from '../contexts/SettingsContext';
import { AppNotification } from '../types';

export const useAppNotifications = () => {
    const { calls } = useCRM();
    const { settings } = useSettings();

    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    useEffect(() => {
        const newNotifications: AppNotification[] = [];
        const now = new Date();

        const overdueCalls = calls.filter(c => c.followUpDate && new Date(c.followUpDate) < now && !c.isFollowUpDone);
        if (overdueCalls.length > 0) {
            newNotifications.push({
                id: 'overdue-calls',
                title: 'Overdue Follow-ups',
                message: `You have ${overdueCalls.length} calls past due.`,
                type: 'alert',
                linkTo: 'Calls',
                timestamp: now.toISOString()
            });
        }

        setNotifications(newNotifications);
    }, [calls, settings]);

    return { notifications };
};
