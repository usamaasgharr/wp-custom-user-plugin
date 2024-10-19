import { useBlockProps } from '@wordpress/block-editor';
import './editor.scss';
import { useState } from 'react';
import UserDropdown from './components/UserDropdown';
import UserForm from './components/UserForm';

export default function Edit() {
    const [selectedUserId, setSelectedUserId] = useState(null);

    return (
        <div {...useBlockProps()}>
            <UserDropdown
                onSelectUser={setSelectedUserId}
            />
            <UserForm
                selectedUserId={selectedUserId}
            />
        </div>
    );
}
