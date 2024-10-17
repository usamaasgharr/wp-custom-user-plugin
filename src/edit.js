import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import './editor.scss';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function Edit({ attributes, setAttributes }) {

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState({
        user_nicename: '',
        display_name: '',
        user_email: '',
        ID: null
    });

    const [isDisabled, setIsDisabled] = useState(true);
    const nonce = window.MyAppData; // Ensure nonce is defined here
    const apiBaseUrl = `${window.location.origin}/wordpress/wp-json/custom-users/v1`; 

    useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await axios.get(`${apiBaseUrl}/users`, {
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': MyAppData.nonce, // Corrected to use MyAppData
					}
				});
				const data = response.data;
				setUsers(data);
				setAttributes({ allUsers: data });
			} catch (error) {
				console.error('There was an error fetching the users:', error);
			}
		};
		fetchUsers();
	}, []);
	

    const getUserByEmail = async (id) => {
        if (!id) {
            setSelectedUser({
                user_nicename: '',
                display_name: '',
                user_email: '',
                ID: null
            });
            setIsDisabled(true);
            return;
        }
        try {
            setIsDisabled(true);
            const response = await axios.get(`${apiBaseUrl}/user/${id}`);
            const data = response.data;
            setSelectedUser(data);
            setAttributes({ selectedUser: data });
            setIsDisabled(false);
        } catch (error) {
            console.error('There was an error fetching the user:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedUser((prevUser) => ({
            ...prevUser,
            [name]: value
        }));
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`${apiBaseUrl}/user/${selectedUser.ID}`, selectedUser, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce, // Include nonce here
                }
            });
            if (response.status === 200) {
                alert('User updated successfully');
            } else {
                alert('Error updating user');
            }
        } catch (error) {
            console.error('There was an error updating the user:', error);
        }
    };

    return (
        <div {...useBlockProps()}>
            <select
                name="email"
                id="email"
                onChange={(e) => {
                    setSelectedUser({
                        user_nicename: '',
                        display_name: '',
                        user_email: '',
                        ID: null
                    });
                    getUserByEmail(e.target.value);
                }}
            >
                <option value="">Select User</option>
                {users.map(user => (
                    <option key={user.id} value={user.ID}>
                        {user.user_email}
                    </option>
                ))}
            </select>

            <form onSubmit={handleUpdateUser}>
                <label htmlFor="user_nicename">Nice Name: </label>
                <input
                    type="text"
                    name="user_nicename"
                    value={selectedUser.user_nicename}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                /> <br />

                <label htmlFor="display_name">Display Name : </label>
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

                <button type="submit" disabled={isDisabled} >Update</button>
            </form>
        </div>
    );
}
