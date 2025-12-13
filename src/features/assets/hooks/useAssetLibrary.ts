import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useState } from 'react';

export function useAssetLibrary(type?: string) {
    const assets = useQuery(api.assets.list, { type });
    const deleteAssetMutation = useMutation(api.assets.deleteAsset);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const deleteAsset = async (id: string) => {
        setDeletingId(id);
        try {
            await deleteAssetMutation({ id: id as any });
        } finally {
            setDeletingId(null);
        }
    };

    return {
        assets,
        isLoading: assets === undefined,
        deleteAsset,
        isDeleting: deletingId !== null,
    };
}
