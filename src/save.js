import { useBlockProps } from '@wordpress/block-editor';

export default function save() {
	return (
		<div {...useBlockProps.save()}>
			{/* Static container for rendering the React component from view.js */}
			<div className="wp-block-create-block-custom-users-block">
				{/* The React form will be dynamically rendered here in view.js */}
				<p>User form will appear here on the frontend.</p>
			</div>
		</div>
	);
}
