import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../src/components/ui/empty-state';
import { File } from 'lucide-react';

describe('EmptyState Component', () => {
    const defaultProps = {
        icon: File,
        title: 'No items found',
        description: 'Try adjusting your search filters',
    };

    it('renders title and description', () => {
        render(<EmptyState {...defaultProps} />);

        expect(screen.getByText('No items found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search filters')).toBeInTheDocument();
    });

    it('renders action button when provided', () => {
        const onAction = jest.fn();
        render(
            <EmptyState
                {...defaultProps}
                action={{ label: 'Create New', onClick: onAction }}
            />
        );

        const button = screen.getByText('Create New');
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('does not render button when action is not provided', () => {
        render(<EmptyState {...defaultProps} />);

        const button = screen.queryByRole('button');
        expect(button).not.toBeInTheDocument();
    });
});
