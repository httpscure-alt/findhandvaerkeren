import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FileUpload } from '@/components/common/FileUpload';

describe('FileUpload Component', () => {
    const mockOnUpload = vi.fn();

    beforeEach(() => {
        mockOnUpload.mockClear();
    });

    it('renders correctly with label', () => {
        render(
            <FileUpload
                onUpload={mockOnUpload}
                lang="en"
                label="Test Label"
            />
        );
        expect(screen.getByText('Test Label')).toBeInTheDocument();
        expect(screen.getByText('Click to upload')).toBeInTheDocument();
    });

    it('renders correctly in Danish', () => {
        render(
            <FileUpload
                onUpload={mockOnUpload}
                lang="da"
                label="Danish Label"
            />
        );
        expect(screen.getByText('Klik for at uploade')).toBeInTheDocument();
        expect(screen.getByText('Danish Label')).toBeInTheDocument();
    });

    it('handles file selection', async () => {
        mockOnUpload.mockResolvedValue('https://example.com/image.jpg');

        render(
            <FileUpload
                onUpload={mockOnUpload}
                lang="en"
            />
        );

        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = screen.getByDisplayValue(''); // hidden file input usually has empty value
        // Better selector for hidden input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

        Object.defineProperty(fileInput, 'files', {
            value: [file]
        });

        fireEvent.change(fileInput);

        await waitFor(() => {
            expect(mockOnUpload).toHaveBeenCalledWith(file);
        });
    });

    it('displays error for large files', async () => {
        render(
            <FileUpload
                onUpload={mockOnUpload}
                lang="en"
                maxSize={1} // 1MB
            />
        );

        const largeFile = new File(['a'.repeat(1024 * 1024 * 2)], 'large.png', { type: 'image/png' });
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

        Object.defineProperty(fileInput, 'files', {
            value: [largeFile]
        });

        fireEvent.change(fileInput);

        expect(await screen.findByText(/File too large/i)).toBeInTheDocument();
        expect(mockOnUpload).not.toHaveBeenCalled();
    });
});
