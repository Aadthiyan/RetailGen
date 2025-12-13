'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { FileArchive, Calendar, Download, HardDrive } from 'lucide-react';

interface ExportHistoryProps {
    creativeId: string;
}

export function ExportHistory({ creativeId }: ExportHistoryProps) {
    const history = useQuery(api.exports.getExportHistory, { creativeId: creativeId as Id<"creatives"> });

    if (!history) return <div className="p-4 text-center text-gray-500">Loading history...</div>;
    if (history.length === 0) return <div className="p-4 text-center text-gray-500">No exports yet.</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                Export History
            </h3>

            <div className="space-y-3">
                {history.map((entry) => (
                    <div key={entry._id} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-purple-50 rounded text-purple-600">
                                    <FileArchive className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {entry.fileCount} Assets
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(entry.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full">
                                {entry.status}
                            </span>
                        </div>

                        <div className="text-xs text-gray-500 mb-2">
                            Formats: {entry.formats.join(', ')}
                        </div>

                        <div className="text-xs text-gray-400">
                            Total Size: {(entry.totalSize / 1024 / 1024).toFixed(2)} MB
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
