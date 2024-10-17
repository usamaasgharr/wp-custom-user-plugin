import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
	const { selectedUser, allUsers } = attributes;
	// console.log("Users", allUsers, selectedUser)

	return (
		<div {...useBlockProps.save()}>
			<select name="email" id="email">
				<option value="">Select User</option>
				{allUsers && allUsers.map(user => (
					<option key={user.id} value={user.id} selected={user.id === selectedUser?.id}>
						{user.email}
					</option>
				))}
			</select>

			<form id="userForm">
				<label htmlFor="firstName">First Name: </label>
				<input
					type="text"
					name="firstName"
					id="firstName"
					defaultValue={selectedUser ? selectedUser.firstName : ''}
				/> <br />

				<label htmlFor="lastName">Last Name: </label>
				<input
					type="text"
					name="lastName"
					id="lastName"
					defaultValue={selectedUser ? selectedUser.lastName : ''}
				/> <br />

				<label htmlFor="email">Email: </label>
				<input
					type="email" 
					name="email"
					id="emailInput"
					defaultValue={selectedUser ? selectedUser.email : ''}
				/> <br />

				<button type="submit" id="updateButton" disabled={!selectedUser}>Update</button>
			</form>
		</div>
	);
}
