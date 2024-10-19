import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDropdown = ({ onSelectUser }) => {
    const [users, setUsers] = useState([]);
    const [access, setAccess] = useState(false);
    const apiBaseUrl = MyAppData.apiUrl;
    // Fetch users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/users`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': MyAppData.nonce,
                    }
                });
                const data = response.data;
                setUsers(data);
            } catch (error) {
                setAccess(true);
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div>
            {access ? <p>You Dont have permission to access  users data</p> : ''}
            <select
                name="email"
                id="email"
                onChange={(e) => onSelectUser(e.target.value)}
            >
                <option value="">Select User</option>
                {users.map(user => (
                    <option key={user.ID} value={user.ID}>
                        {user.user_email}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default UserDropdown;
