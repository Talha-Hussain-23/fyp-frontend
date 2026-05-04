import { useCallback, useState } from 'react';
import axios from '../../axios';

export const useDashboardData = () => {
    const [kpis, setKpis] = useState(null);
    const [trends, setTrends] = useState(null);

    const fetchKPIs = useCallback(async () => {
        try {
            const results = await Promise.allSettled([
                axios.get('/analytics/summary'),
                axios.get('/analytics/trends?days=7')
            ]);
            
            if (results[0].status === 'fulfilled') {
                setKpis(results[0].value.data);
            }
            if (results[1].status === 'fulfilled') {
                setTrends(results[1].value.data);
            }
        } catch (err) {
            console.error('Failed to fetch KPIs:', err);
        }
    }, []);

    return { kpis, trends, fetchKPIs };
};
