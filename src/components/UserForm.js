import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserForm = ({ selectedUserId }) => {
    const [selectedUser, setSelectedUser] = useState({
        user_nicename: '',
        display_name: '',
        user_email: '',
        ID: null
    });
    const [isDisabled, setIsDisabled] = useState(true);
    const apiBaseUrl = MyAppData.apiUrl;

    // Fetch user data when the selected user changes
    useEffect(() => {
        if (!selectedUserId) return;

        const fetchUserById = async (id) => {
            try {
                setIsDisabled(true);
                const response = await axios.get(`${apiBaseUrl}/user/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': MyAppData.nonce,
                    }
                });
                const data = response.data;
                setSelectedUser(data);
                setIsDisabled(false);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUserById(selectedUserId);
    }, [selectedUserId]);

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedUser(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission for updating the user
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`${apiBaseUrl}/user/${selectedUser.ID}`, selectedUser, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': MyAppData.nonce,
                }
            });
            if (response.status === 200) {
                alert('User updated successfully');
            } else {
                alert('Error updating user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    return (
        <form onSubmit={handleUpdateUser}>
            <label htmlFor="user_nicename">Nice Name: </label>
            <input
                type="text"
                name="user_nicename"
                value={selectedUser.user_nicename}
                onChange={handleInputChange}
                disabled={isDisabled}
            /> <br />

            <label htmlFor="display_name">Display Name: </label>
            <input
                type="text"
                name="display_name"
                value={selectedUser.display_name}
                onChange={handleInputChange}
                disabled={isDisabled}
            /> <br />

            <label htmlFor="email">Email: </label>
            <input
                type="email"
                name="user_email"
                value={selectedUser.user_email}
                onChange={handleInputChange}
                disabled={isDisabled}
            /> <br />

            <button type="submit" disabled={isDisabled}>Update</button>
        </form>
    );
};

export default UserForm;
