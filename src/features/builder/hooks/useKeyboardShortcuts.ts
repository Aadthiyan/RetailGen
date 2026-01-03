/**
 * Keyboard Shortcuts Hook - Global keyboard shortcuts for builder
 */

import { useEffect } from 'react';
import { useBuilderStore } from '../store/builderStore';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    description: string;
    action: () => void;
}

export function useKeyboardShortcuts() {
    const { canvas, creativeId } = useBuilderStore();
    const updateCreative = useMutation(api.creatives.update);

    useEffect(() => {
        if (!canvas) return;

        const handleKeyDown = async (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in input fields
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).contentEditable === 'true'
            ) {
                return;
            }

            const ctrl = e.ctrlKey || e.metaKey;
            const shift = e.shiftKey;
            const alt = e.altKey;

            // Ctrl+S - Save
            if (ctrl && e.key === 's') {
                e.preventDefault();
                if (creativeId) {
                    const canvasData = canvas.toJSON(['name', 'selectable', 'evented']);
                    await updateCreative({
                        id: creativeId as any,
                        content: canvasData,
                    });
                    showNotification('💾 Saved!');
                }
            }

            // Ctrl+D - Duplicate
            else if (ctrl && e.key === 'd') {
                e.preventDefault();
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    activeObject.clone((cloned: any) => {
                        cloned.set({
                            left: cloned.left + 10,
                            top: cloned.top + 10,
                        });
                        canvas.add(cloned);
                        canvas.setActiveObject(cloned);
                        canvas.renderAll();
                    });
                    showNotification('📋 Duplicated!');
                }
            }

            // Ctrl+Z - Undo (basic)
            else if (ctrl && e.key === 'z' && !shift) {
                e.preventDefault();
                // Basic undo - remove last object
                const objects = canvas.getObjects();
                if (objects.length > 0) {
                    canvas.remove(objects[objects.length - 1]);
                    canvas.renderAll();
                    showNotification('↶ Undo');
                }
            }

            // Ctrl+Shift+Z or Ctrl+Y - Redo
            else if ((ctrl && shift && e.key === 'z') || (ctrl && e.key === 'y')) {
                e.preventDefault();
                showNotification('↷ Redo (not implemented)');
            }

            // Delete or Backspace - Delete selected
            else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    canvas.remove(activeObject);
                    canvas.renderAll();
                    showNotification('🗑️ Deleted!');
                }
            }

            // Ctrl+A - Select all
            else if (ctrl && e.key === 'a') {
                e.preventDefault();
                const selection = new (window as any).fabric.ActiveSelection(
                    canvas.getObjects(),
                    { canvas }
                );
                canvas.setActiveObject(selection);
                canvas.renderAll();
                showNotification('✓ All selected');
            }

            // Escape - Deselect
            else if (e.key === 'Escape') {
                canvas.discardActiveObject();
                canvas.renderAll();
            }

            // Ctrl+E - Export
            else if (ctrl && e.key === 'e') {
                e.preventDefault();
                const dataURL = canvas.toDataURL({ format: 'png', quality: 1.0 });
                downloadImage(dataURL, 'creative.png');
                showNotification('📥 Exported!');
            }

            // Ctrl+C - Copy
            else if (ctrl && e.key === 'c') {
                e.preventDefault();
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    (canvas as any)._clipboard = activeObject;
                    showNotification('📋 Copied!');
                }
            }

            // Ctrl+V - Paste
            else if (ctrl && e.key === 'v') {
                e.preventDefault();
                const clipboard = (canvas as any)._clipboard;
                if (clipboard) {
                    clipboard.clone((cloned: any) => {
                        cloned.set({
                            left: cloned.left + 10,
                            top: cloned.top + 10,
                        });
                        canvas.add(cloned);
                        canvas.setActiveObject(cloned);
                        canvas.renderAll();
                    });
                    showNotification('📋 Pasted!');
                }
            }

            // Arrow keys - Move selected object
            else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    const step = shift ? 10 : 1;
                    switch (e.key) {
                        case 'ArrowUp':
                            activeObject.set('top', (activeObject.top || 0) - step);
                            break;
                        case 'ArrowDown':
                            activeObject.set('top', (activeObject.top || 0) + step);
                            break;
                        case 'ArrowLeft':
                            activeObject.set('left', (activeObject.left || 0) - step);
                            break;
                        case 'ArrowRight':
                            activeObject.set('left', (activeObject.left || 0) + step);
                            break;
                    }
                    activeObject.setCoords();
                    canvas.renderAll();
                }
            }

            // Ctrl+G - Group
            else if (ctrl && e.key === 'g') {
                e.preventDefault();
                const activeObject = canvas.getActiveObject();
                if (activeObject && activeObject.type === 'activeSelection') {
                    (activeObject as any).toGroup();
                    canvas.renderAll();
                    showNotification('🔗 Grouped!');
                }
            }

            // Ctrl+Shift+G - Ungroup
            else if (ctrl && shift && e.key === 'g') {
                e.preventDefault();
                const activeObject = canvas.getActiveObject();
                if (activeObject && activeObject.type === 'group') {
                    (activeObject as any).toActiveSelection();
                    canvas.renderAll();
                    showNotification('🔓 Ungrouped!');
                }
            }

            // ? - Show shortcuts
            else if (e.key === '?' && shift) {
                e.preventDefault();
                showShortcutsHelp();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [canvas, creativeId, updateCreative]);
}

/**
 * Show notification
 */
function showNotification(message: string) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

/**
 * Download image
 */
function downloadImage(dataURL: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Show shortcuts help
 */
function showShortcutsHelp() {
    const shortcuts = [
        { keys: 'Ctrl+S', description: 'Save' },
        { keys: 'Ctrl+D', description: 'Duplicate' },
        { keys: 'Ctrl+Z', description: 'Undo' },
        { keys: 'Ctrl+Y', description: 'Redo' },
        { keys: 'Delete', description: 'Delete selected' },
        { keys: 'Ctrl+A', description: 'Select all' },
        { keys: 'Escape', description: 'Deselect' },
        { keys: 'Ctrl+E', description: 'Export' },
        { keys: 'Ctrl+C', description: 'Copy' },
        { keys: 'Ctrl+V', description: 'Paste' },
        { keys: 'Arrow Keys', description: 'Move object' },
        { keys: 'Shift+Arrow', description: 'Move 10px' },
        { keys: 'Ctrl+G', description: 'Group' },
        { keys: 'Ctrl+Shift+G', description: 'Ungroup' },
        { keys: '?', description: 'Show shortcuts' },
    ];

    const helpHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;" id="shortcuts-help">
            <div style="background: white; border-radius: 12px; padding: 24px; max-width: 500px; max-height: 80vh; overflow-y: auto;">
                <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">⌨️ Keyboard Shortcuts</h2>
                <div style="display: grid; gap: 8px;">
                    ${shortcuts.map(s => `
                        <div style="display: flex; justify-content: space-between; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                            <span style="font-weight: 500;">${s.keys}</span>
                            <span style="color: #6b7280;">${s.description}</span>
                        </div>
                    `).join('')}
                </div>
                <button onclick="document.getElementById('shortcuts-help').remove()" style="margin-top: 16px; width: 100%; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">
                    Close
                </button>
            </div>
        </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = helpHTML;
    document.body.appendChild(div.firstElementChild!);
}

/**
 * Get all shortcuts
 */
export function getShortcuts(): KeyboardShortcut[] {
    return [
        { key: 's', ctrl: true, description: 'Save', action: () => { } },
        { key: 'd', ctrl: true, description: 'Duplicate', action: () => { } },
        { key: 'z', ctrl: true, description: 'Undo', action: () => { } },
        { key: 'y', ctrl: true, description: 'Redo', action: () => { } },
        { key: 'Delete', description: 'Delete selected', action: () => { } },
        { key: 'a', ctrl: true, description: 'Select all', action: () => { } },
        { key: 'Escape', description: 'Deselect', action: () => { } },
        { key: 'e', ctrl: true, description: 'Export', action: () => { } },
        { key: 'c', ctrl: true, description: 'Copy', action: () => { } },
        { key: 'v', ctrl: true, description: 'Paste', action: () => { } },
        { key: 'g', ctrl: true, description: 'Group', action: () => { } },
        { key: 'g', ctrl: true, shift: true, description: 'Ungroup', action: () => { } },
    ];
}
