import { toPng } from 'html-to-image';

export async function exportReceiptAsImage(
    element: HTMLElement,
    filename: string = 'receipt'
): Promise<void> {
    try {
        const dataUrl = await toPng(element, {
            quality: 1,
            pixelRatio: 2, // High resolution for social media
            backgroundColor: '#f5f3ef', // Paper background
            style: {
                // Ensure fonts are captured
                fontFamily: 'var(--font-mono), ui-monospace, monospace'
            }
        });

        // Create download link
        const link = document.createElement('a');
        link.download = `${filename}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('Failed to export receipt:', error);
        throw error;
    }
}
