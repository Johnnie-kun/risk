import { useState, useEffect } from 'react';

const useChartData = (chartId: string) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching chart data
        const fetchData = async () => {
            // ... fetch chart data logic ...
            setData(fetchedData);
            setLoading(false);
        };

        fetchData();
    }, [chartId]);

    return { data, loading };
};

export default useChartData;
