import { render } from '@wordpress/element';
import { useState } from 'react';
import UserDropdown from './components/UserDropdown';
import UserForm from './components/UserForm';


// The React component for the frontend form
const FrontendUserForm = () => {
	const [selectedUserId, setSelectedUserId] = useState(null);

	// Render the form
	return (
		<div>
			<UserDropdown
				onSelectUser={setSelectedUserId}
			/>
			<UserForm
				selectedUserId={selectedUserId}
			/>
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
