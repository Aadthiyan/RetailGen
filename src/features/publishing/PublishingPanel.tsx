'use client';

import { useState } from 'react';
import { Share2, Facebook, Instagram, Linkedin, Chrome, Check, X, Loader2, Settings } from 'lucide-react';
import { PublishingEngine, Platform, PublishingAccount, CampaignSettings, SAMPLE_LOCATIONS, CAMPAIGN_OBJECTIVES } from '../../lib/publishing/publishingEngine';
import { useBuilderStore } from '../builder/store/builderStore';

export function PublishingPanel() {
    const { canvas } = useBuilderStore();
    const [isOpen, setIsOpen] = useState(false);
    const [accounts, setAccounts] = useState<Record<Platform, PublishingAccount | null>>({
        facebook: null,
        instagram: null,
        google: null,
        linkedin: null,
    });
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>('facebook');
    const [campaign, setCampaign] = useState<CampaignSettings>(PublishingEngine.getDefaultCampaign());
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishResult, setPublishResult] = useState<any>(null);

    const handleConnect = async (platform: Platform) => {
        try {
            const account = await PublishingEngine.authenticate(platform);
            setAccounts(prev => ({ ...prev, [platform]: account }));
            alert(`✓ Successfully connected to ${PublishingEngine.getPlatformName(platform)}!`);
        } catch (error) {
            alert(`Failed to connect to ${platform}. Please try again.`);
        }
    };

    const handleDisconnect = async (platform: Platform) => {
        try {
            await PublishingEngine.disconnect(platform);
            setAccounts(prev => ({ ...prev, [platform]: null }));
            alert(`Disconnected from ${PublishingEngine.getPlatformName(platform)}`);
        } catch (error) {
            alert(`Failed to disconnect. Please try again.`);
        }
    };

    const handlePublish = async () => {
        if (!canvas) {
            alert('No creative to publish');
            return;
        }

        const account = accounts[selectedPlatform];
        if (!account) {
            alert(`Please connect your ${PublishingEngine.getPlatformName(selectedPlatform)} account first`);
            return;
        }

        // Validate campaign
        const validation = PublishingEngine.validateCampaign(campaign);
        if (!validation.valid) {
            alert(`Campaign validation failed:\n${validation.errors.join('\n')}`);
            return;
        }

        setIsPublishing(true);
        setPublishResult(null);

        try {
            // Get creative data
            const creativeData = canvas.toDataURL({ format: 'png', quality: 1.0 });

            // Publish
            const result = await PublishingEngine.publish(
                selectedPlatform,
                { dataUrl: creativeData },
                campaign,
                account
            );

            setPublishResult(result);

            if (result.success) {
                alert(`🎉 ${result.message}`);
            } else {
                alert(`❌ ${result.error || 'Publishing failed'}`);
            }
        } catch (error) {
            alert('Publishing failed. Please try again.');
        } finally {
            setIsPublishing(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-[220px] right-6 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50"
            >
                <Share2 className="w-5 h-5" />
                <span className="font-semibold">Publish</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Share2 className="w-6 h-6" />
                            <div>
                                <h2 className="text-2xl font-bold">Publish to Platforms</h2>
                                <p className="text-blue-100 text-sm">Launch your campaign across ad platforms</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {!publishResult ? (
                        <div className="space-y-6">
                            {/* Platform Accounts */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <PlatformCard
                                        platform="facebook"
                                        icon={<Facebook className="w-6 h-6" />}
                                        account={accounts.facebook}
                                        onConnect={() => handleConnect('facebook')}
                                        onDisconnect={() => handleDisconnect('facebook')}
                                    />
                                    <PlatformCard
                                        platform="instagram"
                                        icon={<Instagram className="w-6 h-6" />}
                                        account={accounts.instagram}
                                        onConnect={() => handleConnect('instagram')}
                                        onDisconnect={() => handleDisconnect('instagram')}
                                    />
                                    <PlatformCard
                                        platform="google"
                                        icon={<Chrome className="w-6 h-6" />}
                                        account={accounts.google}
                                        onConnect={() => handleConnect('google')}
                                        onDisconnect={() => handleDisconnect('google')}
                                    />
                                    <PlatformCard
                                        platform="linkedin"
                                        icon={<Linkedin className="w-6 h-6" />}
                                        account={accounts.linkedin}
                                        onConnect={() => handleConnect('linkedin')}
                                        onDisconnect={() => handleDisconnect('linkedin')}
                                    />
                                </div>
                            </div>

                            {/* Platform Selection */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Platform</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {(['facebook', 'instagram', 'google', 'linkedin'] as Platform[]).map((platform) => (
                                        <button
                                            key={platform}
                                            onClick={() => setSelectedPlatform(platform)}
                                            disabled={!accounts[platform]}
                                            className={`p-4 rounded-lg border-2 transition-all ${selectedPlatform === platform
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                } ${!accounts[platform] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <p className="font-medium text-gray-900 capitalize">{platform}</p>
                                            {accounts[platform] && (
                                                <Check className="w-4 h-4 text-green-600 mx-auto mt-1" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Campaign Settings */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Campaign Settings
                                </h3>

                                <div className="space-y-4">
                                    {/* Campaign Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Campaign Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={campaign.name}
                                            onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., Summer Sale 2026"
                                        />
                                    </div>

                                    {/* Objective & Budget */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Objective
                                            </label>
                                            <select
                                                value={campaign.objective}
                                                onChange={(e) => setCampaign({ ...campaign, objective: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {CAMPAIGN_OBJECTIVES.map((obj) => (
                                                    <option key={obj.value} value={obj.value}>
                                                        {obj.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Daily Budget ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={campaign.budget}
                                                onChange={(e) => setCampaign({ ...campaign, budget: parseFloat(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                min="5"
                                                step="5"
                                            />
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={campaign.startDate}
                                                onChange={(e) => setCampaign({ ...campaign, startDate: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                End Date (Optional)
                                            </label>
                                            <input
                                                type="date"
                                                value={campaign.endDate || ''}
                                                onChange={(e) => setCampaign({ ...campaign, endDate: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Targeting */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Target Locations
                                        </label>
                                        <select
                                            multiple
                                            value={campaign.targeting.locations}
                                            onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                                setCampaign({
                                                    ...campaign,
                                                    targeting: { ...campaign.targeting, locations: selected }
                                                });
                                            }}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            size={4}
                                        >
                                            {SAMPLE_LOCATIONS.map((location) => (
                                                <option key={location} value={location}>
                                                    {location}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                                    </div>

                                    {/* Age & Gender */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Min Age
                                            </label>
                                            <input
                                                type="number"
                                                value={campaign.targeting.ageMin}
                                                onChange={(e) => setCampaign({
                                                    ...campaign,
                                                    targeting: { ...campaign.targeting, ageMin: parseInt(e.target.value) }
                                                })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                min="13"
                                                max="65"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Max Age
                                            </label>
                                            <input
                                                type="number"
                                                value={campaign.targeting.ageMax}
                                                onChange={(e) => setCampaign({
                                                    ...campaign,
                                                    targeting: { ...campaign.targeting, ageMax: parseInt(e.target.value) }
                                                })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                min="13"
                                                max="65"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Gender
                                            </label>
                                            <select
                                                value={campaign.targeting.gender}
                                                onChange={(e) => setCampaign({
                                                    ...campaign,
                                                    targeting: { ...campaign.targeting, gender: e.target.value as any }
                                                })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="all">All</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Publish Button */}
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing || !accounts[selectedPlatform] || !canvas}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPublishing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Publishing to {PublishingEngine.getPlatformName(selectedPlatform)}...
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-5 h-5" />
                                        Launch Campaign on {PublishingEngine.getPlatformName(selectedPlatform)}
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Success Result */
                        <div className="space-y-6">
                            <div className={`border rounded-lg p-6 ${publishResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    {publishResult.success ? (
                                        <Check className="w-8 h-8 text-green-600" />
                                    ) : (
                                        <X className="w-8 h-8 text-red-600" />
                                    )}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {publishResult.success ? 'Campaign Launched!' : 'Publishing Failed'}
                                        </h3>
                                        <p className="text-sm text-gray-600">{publishResult.message}</p>
                                    </div>
                                </div>

                                {publishResult.success && (
                                    <div className="bg-white rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Platform:</span>
                                            <span className="font-medium capitalize">{publishResult.platform}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Campaign ID:</span>
                                            <span className="font-mono text-sm">{publishResult.campaignId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Ad ID:</span>
                                            <span className="font-mono text-sm">{publishResult.adId}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPublishResult(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Publish Another
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface PlatformCardProps {
    platform: Platform;
    icon: React.ReactNode;
    account: PublishingAccount | null;
    onConnect: () => void;
    onDisconnect: () => void;
}

function PlatformCard({ platform, icon, account, onConnect, onDisconnect }: PlatformCardProps) {
    const color = PublishingEngine.getPlatformColor(platform);

    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20', color }}>
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="font-medium text-gray-900">{PublishingEngine.getPlatformName(platform)}</p>
                    <p className="text-xs text-gray-500">
                        {account ? account.accountName : 'Not connected'}
                    </p>
                </div>
            </div>

            {account ? (
                <button
                    onClick={onDisconnect}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                    Disconnect
                </button>
            ) : (
                <button
                    onClick={onConnect}
                    className="w-full px-3 py-1.5 text-sm text-white rounded transition-colors"
                    style={{ backgroundColor: color }}
                >
                    Connect
                </button>
            )}
        </div>
    );
}
