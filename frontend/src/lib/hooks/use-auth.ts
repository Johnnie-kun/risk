import { useState, useEffect } from 'react';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching user data
        const fetchUser = async () => {
            // ... fetch user logic ...
            setUser(fetchedUser);
            setLoading(false);
        };

        fetchUser();
    }, []);

    return { user, loading };
};

export default useAuth;
