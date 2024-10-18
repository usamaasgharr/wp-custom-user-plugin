import { render, useState, useEffect } from '@wordpress/element';
import axios from 'axios';

// The React component for the frontend form
const FrontendUserForm = ({ attributes }) => {
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState({
		user_nicename: '',
		display_name: '',
		user_email: '',
		ID: null
	});
	const [isDisabled, setIsDisabled] = useState(true);
	const apiBaseUrl = MyAppData.apiUrl;

	// Fetch all users on component mount
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await axios.get(`${apiBaseUrl}/users`, {
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': MyAppData.nonce, // Corrected to use MyAppData
					}
				});
				setUsers(response.data);
			} catch (error) {
				alert(error.response.data.message + error.message);
				console.error('There was an error fetching the users:', error);
			}
		};
		fetchUsers();
	}, []);

	// Fetch a user by ID and update the form when a user is selected
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
			const response = await axios.get(`${apiBaseUrl}/user/${id}`, {
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': MyAppData.nonce, // Corrected to use MyAppData
				}
			});
			setSelectedUser(response.data);
			setIsDisabled(false);
		} catch (error) {
			console.error('There was an error fetching the user:', error);
		}
	};

	// Handle input field changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setSelectedUser((prevUser) => ({
			...prevUser,
			[name]: value
		}));
	};

	// Handle the form submission to update the user data
	const handleUpdateUser = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.put(`${apiBaseUrl}/user/${selectedUser.ID}`, selectedUser, {
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': MyAppData.nonce, // Corrected to use MyAppData
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

	// Render the form
	return (
		<div>
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
				{users.map((user) => (
					<option key={user.ID} value={user.ID}>
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

				<button type="submit" disabled={isDisabled}>
					Update
				</button>
			</form>
		</div>
	);
};

// Find the block container in the DOM and render the React component
document.addEventListener('DOMContentLoaded', () => {
	const blockContainers = document.querySelectorAll('.wp-block-create-block-custom-users-block');
	blockContainers.forEach((blockContainer) => {
		render(<FrontendUserForm />, blockContainer);
	});
});
