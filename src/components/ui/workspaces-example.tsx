import * as React from 'react';
import {
	Workspaces,
	WorkspaceTrigger,
	WorkspaceContent,
	type Workspace,
} from '@/components/ui/workspaces';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

// Extended workspace interface for this specific use case
interface MyWorkspace extends Workspace {
	logo: string;
	plan: string;
	slug: string;
}

// Example workspaces with Unsplash images
const workspaces: MyWorkspace[] = [
	{
		id: '1',
		name: 'Asme Inc.',
		logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
		plan: 'Free',
		slug: 'asme',
	},
	{
		id: '2',
		name: 'Bilux Labs',
		logo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=100&h=100&fit=crop',
		plan: 'Pro',
		slug: 'bilux',
	},
	{
		id: '3',
		name: 'Zentra Ltd.',
		logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop',
		plan: 'Team',
		slug: 'zentra',
	},
	{
		id: '4',
		name: 'Nuvex Group',
		logo: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=100&h=100&fit=crop',
		plan: 'Free',
		slug: 'nuvex',
	},
	{
		id: '5',
		name: 'Cortexia',
		logo: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=100&h=100&fit=crop',
		plan: 'Pro',
		slug: 'cortexia',
	},
];

/**
 * Example usage of the Workspaces component
 * This demonstrates how to use the workspace selector dropdown
 */
export default function WorkspacesExample() {
	const [activeWorkspaceId, setActiveWorkspaceId] = React.useState('1');

	const handleWorkspaceChange = (workspace: MyWorkspace) => {
		setActiveWorkspaceId(workspace.id);
		console.log('Selected workspace:', workspace);
	};

	return (
		<div className="flex min-h-screen items-start justify-center gap-8 px-4 py-24">
			<Workspaces
				workspaces={workspaces}
				selectedWorkspaceId={activeWorkspaceId}
				onWorkspaceChange={handleWorkspaceChange}
			>
				<WorkspaceTrigger className="min-w-72" />
				<WorkspaceContent>
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground w-full justify-start"
					>
						<PlusIcon className="mr-2 h-4 w-4" />
						Create workspace
					</Button>
				</WorkspaceContent>
			</Workspaces>
		</div>
	);
}





